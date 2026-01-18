import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';
import { InsightService } from '../../services/insight.service';
import { Insight, GastoInusual } from '../../modelos/insight.model';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    LayoutComponent
  ],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit {
  insights = signal<Insight[]>([]);
  gastosInusuales = signal<GastoInusual[]>([]);
  cargando = signal(false);

  tipoIconos: Record<string, string> = {
    'AHORRO': 'savings',
    'GASTO': 'shopping_cart',
    'TENDENCIA': 'trending_up',
    'ALERTA': 'warning',
    'SUGERENCIA': 'lightbulb'
  };

  prioridadColors: Record<string, string> = {
    'ALTA': '#f44336',
    'MEDIA': '#ff9800',
    'BAJA': '#4caf50'
  };

  constructor(
    private insightService: InsightService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarInsights();
  }

  cargarInsights(): void {
    this.cargando.set(true);
    this.insightService.getInsights().subscribe({
      next: (response) => {
        this.insights.set(response.insights);
        this.gastosInusuales.set(response.gastosInusuales);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar insights:', error);
        this.toastr.error('Error al cargar los insights', 'Error');
        this.cargando.set(false);
      }
    });
  }

  marcarComoLeido(insight: Insight): void {
    if (insight.leido) return;

    this.insightService.marcarComoLeido(insight.id).subscribe({
      next: () => {
        const insightsActualizados = this.insights().map(i => 
          i.id === insight.id ? { ...i, leido: true } : i
        );
        this.insights.set(insightsActualizados);
      },
      error: (error) => {
        console.error('Error al marcar como leído:', error);
      }
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  get insightsNoLeidos(): number {
    return this.insights().filter(i => !i.leido).length;
  }

  get gastosInusualesCount(): number {
    return this.gastosInusuales().length;
  }
}
