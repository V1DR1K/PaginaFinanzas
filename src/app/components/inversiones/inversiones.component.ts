import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';
import { BitgetSubscribeRequest, BitgetTickerUpdate, BitgetWsService, WsConnectionStatus } from '../../services/bitget-ws.service';
import { BinanceWsService, BinanceTickerUpdate, BinanceWsStatus } from '../../services/binance-ws.service';
import { CryptoService } from '../../services/crypto.service';
import { Crypto, CryptoSymbol } from '../../modelos/crypto.model';

interface TokenRow {
  instId: string;
  instType?: string;
  source?: 'bitget' | 'binance';
  display: string;
  last?: number;
  changePct?: number;
  high24h?: number;
  low24h?: number;
  bid?: number;
  ask?: number;
  ts?: number;
}

interface TokenHolding {
  instId: string;
  symbol: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-inversiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutComponent,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatSortModule,
    MatProgressBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.scss'],
})
export class InversionesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('negativeCarousel') negativeCarousel?: ElementRef<HTMLDivElement>;
  @ViewChild('positiveCarousel') positiveCarousel?: ElementRef<HTMLDivElement>;

  // Datos dinámicos
  simbolos: CryptoSymbol[] = [];
  holdings = signal<Crypto[]>([]);
  
  // UI States
  mostrandoFormTenencia = signal(false);
  mostrandoFormSimbolo = signal(false);
  editandoTenencia = signal(false);
  editandoSimbolo = signal(false);
  
  // Forms
  tenenciaForm: FormGroup;
  simboloForm: FormGroup;
  tenenciaSeleccionada: Crypto | null = null;

  rows: TokenRow[] = [];
  connectionStatus: WsConnectionStatus = 'disconnected';
  binanceStatus: BinanceWsStatus = 'disconnected';

  private tickerSub?: Subscription;
  private statusSub?: Subscription;
  private binanceTickerSub?: Subscription;
  private binanceStatusSub?: Subscription;
  private negativeScrollInterval?: any;
  private positiveScrollInterval?: any;
  cargando = signal(true);

  displayedColumns = ['pair', 'last', 'changePct', 'bidAsk', 'range', 'time'];

  constructor(
    private wsService: BitgetWsService,
    private binanceWs: BinanceWsService,
    private cryptoService: CryptoService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.tenenciaForm = this.fb.group({
      instId: ['', Validators.required],
      symbol: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.00000001)]],
      percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      source: ['bitget'],
      display: [''],
      activo: [true]
    });

    this.simboloForm = this.fb.group({
      instId: ['', Validators.required],
      display: ['', Validators.required],
      source: ['bitget']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    // Cargar símbolos
    this.cryptoService.getSymbolos().subscribe({
      next: (simbolos) => {
        this.simbolos = simbolos;
        this.initializeWebSockets();
      },
      error: (error) => {
        console.error('Error al cargar símbolos:', error);
        this.toastr.error('Error al cargar los símbolos', 'Error');
        this.cargando.set(false);
      }
    });

    // Cargar tenencias
    this.cryptoService.getCryptosActivas().subscribe({
      next: (cryptos) => {
        this.holdings.set(cryptos);
      },
      error: (error) => {
        console.error('Error al cargar tenencias:', error);
        this.toastr.error('Error al cargar las tenencias', 'Error');
      }
    });
  }

  initializeWebSockets(): void {
    // Initialize rows
    this.rows = this.simbolos.map((s) => ({
      instId: s.instId,
      display: s.display,
      source: s.source
    }));

    // Subscribe to Bitget tickers
    const bitgetSubs: BitgetSubscribeRequest[] = this.simbolos
      .filter((s) => s.source !== 'binance')
      .map((s) => ({ instId: s.instId }));

    if (bitgetSubs.length) {
      this.tickerSub = this.wsService.subscribeTickers(bitgetSubs).subscribe((update) => {
        this.applyBitgetUpdate(update);
        this.cargando.set(false);
      });
      this.statusSub = this.wsService.connectionStatus$.subscribe((status) => {
        this.connectionStatus = status;
      });
    }

    // Subscribe to Binance tickers
    const binancePairs = this.simbolos
      .filter((s) => s.source === 'binance')
      .map((s) => s.instId);

    if (binancePairs.length) {
      this.binanceTickerSub = this.binanceWs.subscribeTickers(binancePairs).subscribe((update) => {
        this.applyBinanceUpdate(update);
        this.cargando.set(false);
      });
      this.binanceStatusSub = this.binanceWs.connectionStatus$.subscribe((status) => {
        this.binanceStatus = status;
      });
    }
  }

  ngAfterViewInit(): void {
    // Iniciar auto-scroll después de que la vista esté lista
    setTimeout(() => {
      this.startAutoScroll();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.tickerSub?.unsubscribe();
    this.statusSub?.unsubscribe();
    this.wsService.disconnect();
    this.binanceTickerSub?.unsubscribe();
    this.binanceStatusSub?.unsubscribe();
    this.binanceWs.disconnect();
    this.stopAutoScroll();
  }

  startAutoScroll(): void {
    this.negativeScrollInterval = setInterval(() => {
      if (this.negativeCarousel) {
        const container = this.negativeCarousel.nativeElement;
        const scrollAmount = 296; // card width + gap
        
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += scrollAmount;
        }
      }
    }, 3000);

    this.positiveScrollInterval = setInterval(() => {
      if (this.positiveCarousel) {
        const container = this.positiveCarousel.nativeElement;
        const scrollAmount = 296; // card width + gap
        
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += scrollAmount;
        }
      }
    }, 3000);
  }

  stopAutoScroll(): void {
    if (this.negativeScrollInterval) {
      clearInterval(this.negativeScrollInterval);
    }
    if (this.positiveScrollInterval) {
      clearInterval(this.positiveScrollInterval);
    }
  }

  applyBitgetUpdate(update: BitgetTickerUpdate): void {
    const row = this.rows.find((r) => r.instId === update.instId);
    if (!row) return;

    row.last = update.last ?? row.last;
    row.changePct = update.changePct ?? row.changePct;
    row.high24h = update.high24h ?? row.high24h;
    row.low24h = update.low24h ?? row.low24h;
    row.bid = update.bid ?? row.bid;
    row.ask = update.ask ?? row.ask;
    row.ts = update.ts ?? Date.now();
  }

  applyBinanceUpdate(update: BinanceTickerUpdate): void {
    const row = this.rows.find((r) => r.instId === update.instId);
    if (!row) return;

    row.last = update.last ?? row.last;
    row.changePct = update.changePct ?? row.changePct;
    row.high24h = update.high24h ?? row.high24h;
    row.low24h = update.low24h ?? row.low24h;
    row.bid = update.bid ?? row.bid;
    row.ask = update.ask ?? row.ask;
    row.ts = update.ts ?? Date.now();
  }

  formatNumber(value?: number, digits: number = 2): string {
    if (value === undefined || value === null || Number.isNaN(value)) return '-';
    return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  formatTime(ts?: number): string {
    if (!ts) return '-';
    const date = new Date(ts);
    return date.toLocaleTimeString();
  }

  get negativeTokens(): TokenRow[] {
    return this.rows.filter((r) => r.changePct !== undefined && r.changePct < 0);
  }

  get positiveTokens(): TokenRow[] {
    return this.rows.filter((r) => r.changePct === undefined || r.changePct >= 0);
  }

  get totalBalance(): number {
    return this.holdings().reduce((total, holding) => {
      const tokenRow = this.rows.find(r => r.instId === holding.instId);
      if (tokenRow && tokenRow.last) {
        const price = holding.instId === 'PEPEUSDT' ? tokenRow.last / 1000 : tokenRow.last;
        return total + (holding.amount * price);
      }
      return total;
    }, 0);
  }

  getHoldingValue(instId: string): number {
    const holding = this.holdings().find(h => h.instId === instId);
    const tokenRow = this.rows.find(r => r.instId === instId);
    
    if (!holding || !tokenRow || !tokenRow.last) return 0;
    
    const price = instId === 'PEPEUSDT' ? tokenRow.last / 1000 : tokenRow.last;
    return holding.amount * price;
  }

  getHoldingAmount(instId: string): number {
    const holding = this.holdings().find(h => h.instId === instId);
    return holding?.amount || 0;
  }

  // ===== CRUD TENENCIAS =====
  
  nuevaTenencia(): void {
    this.editandoTenencia.set(false);
    this.tenenciaSeleccionada = null;
    this.tenenciaForm.reset({
      source: 'bitget',
      activo: true
    });
    this.mostrandoFormTenencia.set(true);
  }

  editarTenencia(crypto: Crypto): void {
    this.editandoTenencia.set(true);
    this.tenenciaSeleccionada = crypto;
    this.tenenciaForm.patchValue({
      instId: crypto.instId,
      symbol: crypto.symbol,
      amount: crypto.amount,
      percentage: crypto.percentage,
      source: crypto.source || 'bitget',
      display: crypto.display,
      activo: crypto.activo
    });
    this.mostrandoFormTenencia.set(true);
  }

  guardarTenencia(): void {
    if (this.tenenciaForm.invalid) {
      this.toastr.warning('Por favor completa todos los campos', 'Formulario inválido');
      return;
    }

    const request = this.tenenciaForm.value;

    if (this.editandoTenencia() && this.tenenciaSeleccionada) {
      this.cryptoService.updateCrypto(this.tenenciaSeleccionada.id, request).subscribe({
        next: () => {
          this.toastr.success('Tenencia actualizada correctamente', 'Éxito');
          this.cancelarFormTenencia();
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al actualizar tenencia:', error);
          this.toastr.error('Error al actualizar la tenencia', 'Error');
        }
      });
    } else {
      this.cryptoService.createCrypto(request).subscribe({
        next: () => {
          this.toastr.success('Tenencia creada correctamente', 'Éxito');
          this.cancelarFormTenencia();
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al crear tenencia:', error);
          this.toastr.error('Error al crear la tenencia', 'Error');
        }
      });
    }
  }

  eliminarTenencia(crypto: Crypto): void {
    if (!confirm(`¿Eliminar la tenencia de ${crypto.symbol}?`)) return;

    this.cryptoService.deleteCrypto(crypto.id).subscribe({
      next: () => {
        this.toastr.success('Tenencia eliminada correctamente', 'Éxito');
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al eliminar tenencia:', error);
        this.toastr.error('Error al eliminar la tenencia', 'Error');
      }
    });
  }

  toggleActivoTenencia(crypto: Crypto): void {
    this.cryptoService.toggleActivo(crypto.id).subscribe({
      next: () => {
        this.toastr.success(
          crypto.activo ? 'Tenencia desactivada' : 'Tenencia activada',
          'Éxito'
        );
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.toastr.error('Error al cambiar el estado', 'Error');
      }
    });
  }

  cancelarFormTenencia(): void {
    this.mostrandoFormTenencia.set(false);
    this.editandoTenencia.set(false);
    this.tenenciaSeleccionada = null;
    this.tenenciaForm.reset();
  }

  cancelarFormSimbolo(): void {
    this.mostrandoFormSimbolo.set(false);
    this.editandoSimbolo.set(false);
    this.simboloForm.reset();
  }
}
