import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';
import { BitgetSubscribeRequest, BitgetTickerUpdate, BitgetWsService, WsConnectionStatus } from '../../services/bitget-ws.service';
import { BinanceWsService, BinanceTickerUpdate, BinanceWsStatus } from '../../services/binance-ws.service';

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
  imports: [CommonModule, LayoutComponent, MatCardModule, MatTableModule, MatChipsModule, MatIconModule, MatSortModule, MatProgressBarModule],
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.scss'],
})
export class InversionesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('negativeCarousel') negativeCarousel?: ElementRef<HTMLDivElement>;
  @ViewChild('positiveCarousel') positiveCarousel?: ElementRef<HTMLDivElement>;

  readonly tokens: TokenRow[] = [
    { instId: 'BTCUSDT', display: 'BTC / USDT' },
    { instId: 'ETHUSDT', display: 'ETH / USDT' },
    { instId: 'SOLUSDT', display: 'SOL / USDT' },
    { instId: 'PEPEUSDT', display: '1000PEPE / USDT' },
    { instId: 'BGBUSDT', display: 'BGB / USDT' },
    { instId: 'THETAUSDT', display: 'THETA / USDT', source: 'binance' },
    { instId: 'AVAXUSDT', display: 'AVAX / USDT' },
    { instId: 'RONINUSDT', display: 'RONIN / USDT', source: 'binance' },
    { instId: 'BANANAUSDT', display: 'BANANA / USDT' },
    { instId: 'FILUSDT', display: 'FIL / USDT' },
    { instId: 'ADAUSDT', display: 'ADA / USDT' },
    { instId: 'HBARUSDT', display: 'HBAR / USDT' },
    { instId: 'BTCEUR', display: 'BTC / EUR' },
  ];

  // Tenencias actuales hardcodeadas
  readonly holdings: TokenHolding[] = [
    { instId: 'ETHUSDT', symbol: 'ETH', amount: 0.4889803, percentage: 43.10 },
    { instId: 'SOLUSDT', symbol: 'SOL', amount: 5.51308848, percentage: 21.16 },
    { instId: 'PEPEUSDT', symbol: 'PEPE', amount: 66392802.517, percentage: 10.35 },
    { instId: 'BGBUSDT', symbol: 'BGB', amount: 86.8479651, percentage: 8.74 },
    { instId: 'AVAXUSDT', symbol: 'AVAX', amount: 15.7641201, percentage: 5.79 },
    { instId: 'FILUSDT', symbol: 'FIL', amount: 108.2227, percentage: 4.47 },
    { instId: 'ADAUSDT', symbol: 'ADA', amount: 329.751918, percentage: 3.49 },
    { instId: 'BANANAUSDT', symbol: 'BANANA', amount: 7.63236, percentage: 1.49 },
    { instId: 'RONINUSDT', symbol: 'RON', amount: 286.87335, percentage: 1.35 },
    { instId: 'THETAUSDT', symbol: 'THETA', amount: 277.3742, percentage: 0 },
  ];

  rows: TokenRow[] = [];
  connectionStatus: WsConnectionStatus = 'disconnected';
  binanceStatus: BinanceWsStatus = 'disconnected';

  private tickerSub?: Subscription;
  private statusSub?: Subscription;
  private binanceTickerSub?: Subscription;
  private binanceStatusSub?: Subscription;
  private negativeScrollInterval?: any;
  private positiveScrollInterval?: any;
  cargando: boolean = true;

  displayedColumns = ['pair', 'last', 'changePct', 'bidAsk', 'range', 'time'];

  constructor(private wsService: BitgetWsService, private binanceWs: BinanceWsService) {}

  ngOnInit(): void {
    // Initialize rows to preserve order
    this.rows = this.tokens.map((t) => ({ ...t }));

    const bitgetSubs: BitgetSubscribeRequest[] = this.tokens
      .filter((t) => t.source !== 'binance')
      .map((t) => ({ instId: t.instId, instType: t.instType }));

    if (bitgetSubs.length) {
      this.tickerSub = this.wsService.subscribeTickers(bitgetSubs).subscribe((update) => {
        this.applyBitgetUpdate(update);
        this.cargando = false;
      });
      this.statusSub = this.wsService.connectionStatus$.subscribe((status) => {
        this.connectionStatus = status;
      });
    }

    const binancePairs = this.tokens.filter((t) => t.source === 'binance').map((t) => t.instId);
    if (binancePairs.length) {
      this.binanceTickerSub = this.binanceWs.subscribeTickers(binancePairs).subscribe((update) => {
        this.applyBinanceUpdate(update);
        this.cargando = false;
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
    return this.holdings.reduce((total, holding) => {
      const tokenRow = this.rows.find(r => r.instId === holding.instId);
      if (tokenRow && tokenRow.last) {
        // Para PEPE, el precio es por 1000 tokens
        const price = holding.instId === 'PEPEUSDT' ? tokenRow.last / 1000 : tokenRow.last;
        return total + (holding.amount * price);
      }
      return total;
    }, 0);
  }

  getHoldingValue(instId: string): number {
    const holding = this.holdings.find(h => h.instId === instId);
    const tokenRow = this.rows.find(r => r.instId === instId);
    
    if (!holding || !tokenRow || !tokenRow.last) return 0;
    
    // Para PEPE, el precio es por 1000 tokens
    const price = instId === 'PEPEUSDT' ? tokenRow.last / 1000 : tokenRow.last;
    return holding.amount * price;
  }

  getHoldingAmount(instId: string): number {
    const holding = this.holdings.find(h => h.instId === instId);
    return holding?.amount || 0;
  }
}
