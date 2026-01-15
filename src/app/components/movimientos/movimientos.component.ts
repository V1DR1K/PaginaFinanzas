import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { LayoutComponent } from '../layout/layout.component';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../modelos/movimiento.model';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    LayoutComponent,
  ],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
})
export class MovimientosComponent implements OnInit {
  movimientos: Movimiento[] = [];
  filtroForm: FormGroup;
  displayedColumns: string[] = ['id', 'tipo', 'cantidad', 'fecha', 'acciones'];
  
  // Estadísticas
  totalIngresos: number = 0;
  totalEgresos: number = 0;
  balance: number = 0;

  constructor(
    private movimientoService: MovimientoService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      mes: [new Date().getMonth() + 1],
      anio: [new Date().getFullYear()],
      dia: [''],
    });
  }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.movimientoService.findAllMovimientos().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
      },
    });
  }

  calcularEstadisticas(): void {
    const filtrados = this.aplicarFiltros();
    this.totalIngresos = filtrados
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.cantidad, 0);

    this.totalEgresos = filtrados
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.cantidad, 0);

    this.balance = this.totalIngresos - this.totalEgresos;
  }

  aplicarFiltros(): Movimiento[] {
    const mes = this.filtroForm.get('mes')?.value;
    const anio = this.filtroForm.get('anio')?.value;
    const dia = this.filtroForm.get('dia')?.value;

    return this.movimientos.filter((m) => {
      const fecha = new Date(m.fecha);
      const cumpleMes = fecha.getMonth() + 1 === mes;
      const cumpleAnio = fecha.getFullYear() === anio;
      const cumpleDia = !dia || fecha.getDate() === parseInt(dia);

      return cumpleMes && cumpleAnio && cumpleDia;
    });
  }

  onFiltroChange(): void {
    this.calcularEstadisticas();
  }

  eliminarMovimiento(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este movimiento?')) {
      this.movimientoService.deleteMovimiento(id).subscribe({
        next: () => {
          this.cargarMovimientos();
        },
        error: (error) => {
          console.error('Error al eliminar movimiento:', error);
        },
      });
    }
  }

  editarMovimiento(movimiento: Movimiento): void {
    // TODO: Implementar diálogo de edición
    console.log('Editar:', movimiento);
  }

  agregarMovimiento(): void {
    // TODO: Implementar diálogo para agregar
    console.log('Agregar nuevo movimiento');
  }
}
