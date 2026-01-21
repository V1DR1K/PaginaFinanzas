//
import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutComponent } from '../layout/layout.component';
import { MovimientoService } from '../../services/movimiento.service';
import { CategoriaService } from '../../services/categoria.service';
import { MovimientoRecurrenteService } from '../../services/movimiento-recurrente.service';
import { InsightService } from '../../services/insight.service';
import { DolarService, DolarTipo } from '../../services/dolar.service';
import { Movimiento } from '../../modelos/movimiento.model';
import { Evento } from '../../modelos/evento.model';
import { TipoEvento } from '../../modelos/tipo-evento.model';
import { EventoService } from '../../services/evento.service';
import { TipoEventoService } from '../../services/tipo-evento.service';
// import { Evento } from '../../modelos/evento.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    LayoutComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('eventosCarousel') eventosCarousel?: ElementRef<HTMLDivElement>;
    private eventosScrollInterval?: any;
  cargando = signal(false);
  
  // Estadísticas generales
  totalMovimientos = signal(0);
  totalIngresos = signal(0);
  totalEgresos = signal(0);
  balance = signal(0);
  
  // Datos para las cards
  totalCategorias = signal(0);
  totalRecurrentes = signal(0);
  recurrentesActivos = signal(0);
  totalInsights = signal(0);
  insightsNoLeidos = signal(0);
  
  // Últimos movimientos
  ultimosMovimientos = signal<Movimiento[]>([]);
  dolares = signal<DolarTipo[]>([]);
  dolarCargando = signal(false);
  mostrarValores = signal(false);

  eventos: Evento[] = [];
  tipos: TipoEvento[] = [];
  eventosCargando = signal(false);

  constructor(
    private router: Router,
    private movimientoService: MovimientoService,
    private categoriaService: CategoriaService,
    private recurrenteService: MovimientoRecurrenteService,
    private insightService: InsightService,
    private dolarService: DolarService,
    private eventoService: EventoService,
    private tipoEventoService: TipoEventoService
  ) {}


  // ngOnInit duplicado eliminado, ya está definido correctamente arriba

  cargarEventos(): void {
    this.eventosCargando.set(true);
    this.eventoService.getEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.eventosCargando.set(false);
      },
      error: () => this.eventosCargando.set(false)
    });
  }

  cargarTiposEvento(): void {
    this.tipoEventoService.getTipos().subscribe({
      next: (tipos) => this.tipos = tipos
    });
  }

  getTipoNombre(tipoId?: string): string {
    return this.tipos.find(t => t.id === tipoId)?.nombre || '';
  }

  getTipoColor(tipoId?: string): string {
    const tipo = this.tipos.find(t => t.id === tipoId);
    if (!tipo) return '#bdbdbd';
    return tipo.color || '#bdbdbd';
  }

  cargarDashboard(): void {
    this.cargando.set(true);
    
    // Cargar movimientos
    this.movimientoService.findAllMovimientos().subscribe({
      next: (movimientos) => {
        this.totalMovimientos.set(movimientos.length);
        
        const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.cantidad, 0);
        const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.cantidad, 0);
        
        this.totalIngresos.set(ingresos);
        this.totalEgresos.set(egresos);
        this.balance.set(ingresos - egresos);
        
        // Últimos 5 movimientos
        this.ultimosMovimientos.set(movimientos.slice(-5).reverse());
        
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
    
    // Cargar categorías
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => this.totalCategorias.set(categorias.length)
    });
    
    // Cargar recurrentes
    this.recurrenteService.getMovimientosRecurrentes().subscribe({
      next: (recurrentes) => {
        this.totalRecurrentes.set(recurrentes.length);
        this.recurrentesActivos.set(recurrentes.filter(r => r.activo).length);
      }
    });
    
    // Cargar insights
    this.insightService.getInsights().subscribe({
      next: (response) => {
        this.totalInsights.set(response.insights.length);
        this.insightsNoLeidos.set(response.insights.filter(i => !i.leido).length);
      }
    });
  }

  ngOnInit(): void {
    this.cargarDashboard();
    this.cargarDolares();
    this.cargarEventos();
    this.cargarTiposEvento();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startEventosAutoScroll();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopEventosAutoScroll();
  }

  startEventosAutoScroll(): void {
    // Each card is 280px + gap (16px default from $spacing-lg)
    const cardWidth = 280 + 16;
    this.eventosScrollInterval = setInterval(() => {
      if (this.eventosCarousel) {
        const container = this.eventosCarousel.nativeElement;
        // Only scroll if there are enough eventos
        if (this.eventos.length === 0) return;
        // Total width of one set
        const totalSetWidth = cardWidth * this.eventos.length;
        // If we've scrolled past the first set, reset seamlessly
        if (container.scrollLeft >= totalSetWidth) {
          container.scrollLeft = container.scrollLeft - totalSetWidth;
        }
        container.scrollLeft += cardWidth;
      }
    }, 3000);
  }

  stopEventosAutoScroll(): void {
    if (this.eventosScrollInterval) {
      clearInterval(this.eventosScrollInterval);
    }
  }

  cargarDolares(): void {
    this.dolarCargando.set(true);
    this.dolarService.getDolares().subscribe({
      next: (d) => {
        this.dolares.set(d);
        this.dolarCargando.set(false);
      },
      error: () => this.dolarCargando.set(false)
    });
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
