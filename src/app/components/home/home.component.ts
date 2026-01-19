import { Component, OnInit, signal } from '@angular/core';
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
export class HomeComponent implements OnInit {
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

  constructor(
    private router: Router,
    private movimientoService: MovimientoService,
    private categoriaService: CategoriaService,
    private recurrenteService: MovimientoRecurrenteService,
    private insightService: InsightService,
    private dolarService: DolarService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
    this.cargarDolares();
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
