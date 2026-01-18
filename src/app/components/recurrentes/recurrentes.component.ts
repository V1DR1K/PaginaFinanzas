import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';
import { MovimientoRecurrenteService } from '../../services/movimiento-recurrente.service';
import { CategoriaService } from '../../services/categoria.service';
import { MovimientoRecurrente, MovimientoRecurrenteRequest, Frecuencia } from '../../modelos/movimiento-recurrente.model';
import { Categoria } from '../../modelos/categoria.model';

@Component({
  selector: 'app-recurrentes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    LayoutComponent
  ],
  templateUrl: './recurrentes.component.html',
  styleUrls: ['./recurrentes.component.scss']
})
export class RecurrentesComponent implements OnInit {
  recurrentes = signal<MovimientoRecurrente[]>([]);
  categorias = signal<Categoria[]>([]);
  mostrandoFormulario = signal(false);
  cargando = signal(false);
  editando = signal(false);
  recurrenteForm: FormGroup;
  recurrenteSeleccionado: MovimientoRecurrente | null = null;

  frecuencias: Frecuencia[] = ['DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'];

  frecuenciaLabels: Record<Frecuencia, string> = {
    'DIARIA': 'Diaria',
    'SEMANAL': 'Semanal',
    'QUINCENAL': 'Quincenal',
    'MENSUAL': 'Mensual',
    'TRIMESTRAL': 'Trimestral',
    'SEMESTRAL': 'Semestral',
    'ANUAL': 'Anual'
  };

  constructor(
    private recurrenteService: MovimientoRecurrenteService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.recurrenteForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      tipo: ['egreso', Validators.required],
      categoriaId: ['', Validators.required],
      frecuencia: ['MENSUAL', Validators.required],
      diaEjecucion: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      fechaInicio: ['', Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarRecurrentes();
    this.cargarCategorias();
  }

  cargarRecurrentes(): void {
    this.cargando.set(true);
    this.recurrenteService.getMovimientosRecurrentes().subscribe({
      next: (data) => {
        this.recurrentes.set(data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar movimientos recurrentes:', error);
        this.toastr.error('Error al cargar los movimientos', 'Error');
        this.cargando.set(false);
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  nuevoRecurrente(): void {
    this.editando.set(false);
    this.recurrenteSeleccionado = null;
    const hoy = new Date().toISOString().split('T')[0];
    this.recurrenteForm.reset({
      tipo: 'egreso',
      frecuencia: 'MENSUAL',
      diaEjecucion: new Date().getDate(),
      activo: true,
      fechaInicio: hoy
    });
    this.mostrandoFormulario.set(true);
  }

  editarRecurrente(recurrente: MovimientoRecurrente): void {
    this.editando.set(true);
    this.recurrenteSeleccionado = recurrente;
    const fecha = recurrente.fechaInicio ? new Date(recurrente.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    this.recurrenteForm.patchValue({
      descripcion: recurrente.descripcion,
      cantidad: recurrente.cantidad,
      tipo: recurrente.tipo,
      categoriaId: recurrente.categoriaId,
      frecuencia: recurrente.frecuencia,
      diaEjecucion: recurrente.diaEjecucion,
      fechaInicio: fecha,
      activo: recurrente.activo
    });
    this.mostrandoFormulario.set(true);
  }

  guardar(): void {
    if (this.recurrenteForm.invalid) {
      this.toastr.warning('Por favor completa todos los campos', 'Formulario inválido');
      return;
    }

    const formValue = this.recurrenteForm.value;
    const request: MovimientoRecurrenteRequest = {
      descripcion: formValue.descripcion,
      cantidad: Number(formValue.cantidad),
      tipo: formValue.tipo,
      tipoMovimiento: 'GASTO', // Valor por defecto, puede ser mejorado
      categoriaId: Number(formValue.categoriaId),
      frecuencia: formValue.frecuencia,
      diaEjecucion: Number(formValue.diaEjecucion),
      fechaInicio: formValue.fechaInicio,
      activo: formValue.activo
    };

    if (this.editando() && this.recurrenteSeleccionado) {
      this.recurrenteService.updateMovimientoRecurrente(this.recurrenteSeleccionado.id, request).subscribe({
        next: () => {
          this.toastr.success('Movimiento actualizado correctamente', 'Éxito');
          this.cargarRecurrentes();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.toastr.error('Error al actualizar el movimiento', 'Error');
        }
      });
    } else {
      this.recurrenteService.createMovimientoRecurrente(request).subscribe({
        next: () => {
          this.toastr.success('Movimiento creado correctamente', 'Éxito');
          this.cargarRecurrentes();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.toastr.error('Error al crear el movimiento', 'Error');
        }
      });
    }
  }

  toggleActivo(recurrente: MovimientoRecurrente): void {
    this.recurrenteService.toggleActivo(recurrente.id).subscribe({
      next: () => {
        this.toastr.success(
          recurrente.activo ? 'Movimiento desactivado' : 'Movimiento activado',
          'Éxito'
        );
        this.cargarRecurrentes();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.toastr.error('Error al cambiar el estado', 'Error');
      }
    });
  }

  ejecutarAhora(recurrente: MovimientoRecurrente): void {
    if (!confirm(`¿Ejecutar "${recurrente.descripcion}" ahora?`)) {
      return;
    }

    this.recurrenteService.ejecutarAhora(recurrente.id).subscribe({
      next: () => {
        this.toastr.success('Movimiento ejecutado correctamente', 'Éxito');
        this.cargarRecurrentes();
      },
      error: (error) => {
        console.error('Error al ejecutar:', error);
        this.toastr.error('Error al ejecutar el movimiento', 'Error');
      }
    });
  }

  eliminarRecurrente(recurrente: MovimientoRecurrente): void {
    if (!confirm(`¿Eliminar "${recurrente.descripcion}"?`)) {
      return;
    }

    this.recurrenteService.deleteMovimientoRecurrente(recurrente.id).subscribe({
      next: () => {
        this.toastr.success('Movimiento eliminado correctamente', 'Éxito');
        this.cargarRecurrentes();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.toastr.error('Error al eliminar el movimiento', 'Error');
      }
    });
  }

  cancelar(): void {
    this.mostrandoFormulario.set(false);
    this.recurrenteSeleccionado = null;
    this.recurrenteForm.reset();
  }

  get categoriasPorTipo(): Categoria[] {
    const tipo = this.recurrenteForm.get('tipo')?.value;
    return this.categorias().filter(c => c.tipo === tipo);
  }

  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias().find(c => c.id === categoriaId);
    return categoria?.nombre || 'Sin categoría';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
