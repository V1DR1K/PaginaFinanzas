// filepath: d:\Importante\PaginaFinanzas\src\app\components\home\home.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ahorrosService } from '../../services/ahorrosService.service';
import { TransaccionesComponent } from '../transacciones/transacciones.component';

@Component({
  selector: 'app-home',
  standalone: true, // Marca el componente como standalone
  imports: [CommonModule, TransaccionesComponent], // Importa el nuevo componente
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>; // Referencia al canvas del gráfico
  currentMonth: string = '';
  ingresos: number = 0;
  gastos: number = 0;
  ahorros: number = 0;
  transacciones: { descripcion: string; monto: number; tipo: string }[] = [];

  constructor(private ahorrosService: ahorrosService) {
    // Registrar los componentes de Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Obtener el mes actual
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const currentDate = new Date();
    this.currentMonth = months[currentDate.getMonth()];

    // Consultar estadísticas desde el backend
    this.ahorrosService.getEstadisticasEsteMes().subscribe((data) => {
      this.ingresos = data.ingresos;
      this.gastos = data.gastos;
      this.ahorros = data.ahorros;

      // Renderizar el gráfico después de obtener los datos
      this.renderChart();
    });
  }

  private renderChart(): void {
    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Gastos', 'Ahorros', 'Ingresos'],
          datasets: [
            {
              data: [this.gastos, this.ahorros, this.ingresos],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colores para cada segmento
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    }
  }
}
