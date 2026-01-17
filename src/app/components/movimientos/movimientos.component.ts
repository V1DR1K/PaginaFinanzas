import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento, TipoMovimiento } from '../../modelos/movimiento.model';

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
    ToastrModule,
    LayoutComponent,
  ],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
})
export class MovimientosComponent implements OnInit {
  movimientos: Movimiento[] = [];
  filtroForm: FormGroup;
  nuevoMovimientoForm: FormGroup;
  displayedColumns: string[] = ['id', 'tipo', 'tipoMovimiento', 'cantidad', 'descripcion', 'fecha', 'acciones'];
  
  // Enum para el template
  TipoMovimiento = TipoMovimiento;
  tiposEgreso = [TipoMovimiento.GASTO, TipoMovimiento.INVERSION];
  
  // Estados
  mostrandoFormulario: boolean = false;
  cargandoMovimiento: boolean = false;
  editandoMovimiento: boolean = false;
  movimientoEnEdicion: Movimiento | null = null;
  
  // Estadísticas
  totalIngresos: number = 0;
  totalEgresos: number = 0;
  balance: number = 0;

  constructor(
    private movimientoService: MovimientoService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.filtroForm = this.fb.group({
      mes: [new Date().getMonth() + 1],
      anio: [new Date().getFullYear()],
      dia: [''],
    });

    this.nuevoMovimientoForm = this.fb.group({
      tipo: ['ingreso', Validators.required],
      tipoMovimiento: [TipoMovimiento.SALARIO, Validators.required],
      cantidad: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      fecha: [new Date(), Validators.required],
      descripcion: [''],
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
        this.toastr.error('Error al cargar los movimientos', 'Error');
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
          this.toastr.success('Movimiento eliminado correctamente', 'Éxito');
          this.cargarMovimientos();
        },
        error: (error) => {
          console.error('Error al eliminar movimiento:', error);
          this.toastr.error('Error al eliminar el movimiento', 'Error');
        },
      });
    }
  }

  agregarMovimiento(): void {
    this.mostrandoFormulario = true;
    this.editandoMovimiento = false;
    this.movimientoEnEdicion = null;
    this.nuevoMovimientoForm.reset({
      tipo: 'ingreso',
      tipoMovimiento: TipoMovimiento.SALARIO,
      cantidad: '',
      fecha: new Date(),
      descripcion: '',
    });
  }

  editarMovimiento(movimiento: Movimiento): void {
    this.mostrandoFormulario = true;
    this.editandoMovimiento = true;
    this.movimientoEnEdicion = movimiento;
    this.nuevoMovimientoForm.patchValue({
      tipo: movimiento.tipo,
      tipoMovimiento: movimiento.tipoMovimiento,
      cantidad: movimiento.cantidad,
      fecha: new Date(movimiento.fecha),
      descripcion: movimiento.descripcion || '',
    });
  }

  onTipoChange(): void {
    const tipo = this.nuevoMovimientoForm.get('tipo')?.value;
    
    if (tipo === 'ingreso') {
      this.nuevoMovimientoForm.patchValue({ tipoMovimiento: TipoMovimiento.SALARIO });
    } else {
      this.nuevoMovimientoForm.patchValue({ tipoMovimiento: TipoMovimiento.GASTO });
    }
  }

  cancelarMovimiento(): void {
    this.mostrandoFormulario = false;
  }

  guardarMovimiento(): void {
    if (this.nuevoMovimientoForm.invalid) {
      this.toastr.warning('Por favor completa todos los campos correctamente', 'Validación');
      return;
    }

    this.cargandoMovimiento = true;

    const formValue = this.nuevoMovimientoForm.value;
    const fecha = new Date(formValue.fecha);
    
    // Convertir fecha a formato ISO (localDate YYYY-MM-DD)
    const fechaISO = fecha.toISOString().split('T')[0];

    const datosMovimiento = {
      tipo: formValue.tipo,
      tipoMovimiento: formValue.tipoMovimiento,
      cantidad: parseFloat(formValue.cantidad),
      fecha: fechaISO,
      descripcion: formValue.descripcion || null,
    };

    if (this.editandoMovimiento && this.movimientoEnEdicion) {
      // Editar movimiento existente
      this.movimientoService.editMovimiento(this.movimientoEnEdicion.id, datosMovimiento).subscribe({
        next: () => {
          this.toastr.success('Movimiento actualizado correctamente', 'Éxito');
          this.mostrandoFormulario = false;
          this.editandoMovimiento = false;
          this.movimientoEnEdicion = null;
          this.cargarMovimientos();
          this.cargandoMovimiento = false;
        },
        error: (error) => {
          console.error('Error al editar movimiento:', error);
          this.toastr.error('Error al actualizar el movimiento. Intenta nuevamente', 'Error');
          this.cargandoMovimiento = false;
        },
      });
    } else {
      // Crear nuevo movimiento
      this.movimientoService.newMovimiento(datosMovimiento).subscribe({
        next: () => {
          this.toastr.success('Movimiento guardado correctamente', 'Éxito');
          this.mostrandoFormulario = false;
          this.cargarMovimientos();
          this.cargandoMovimiento = false;
        },
        error: (error) => {
          console.error('Error al crear movimiento:', error);
          this.toastr.error('Error al guardar el movimiento. Intenta nuevamente', 'Error');
          this.cargandoMovimiento = false;
        },
      });
    }
  }}