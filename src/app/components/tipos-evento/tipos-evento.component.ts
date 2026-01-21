import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TipoEventoService } from '../../services/tipo-evento.service';
import { TipoEvento } from '../../modelos/tipo-evento.model';
import { LayoutComponent } from '../layout/layout.component';
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-tipos-evento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    LayoutComponent,
    MatIcon,
    MatProgressBar
],
  templateUrl: './tipos-evento.component.html',
  styleUrls: ['./tipos-evento.component.scss']
})
export class TiposEventoComponent implements OnInit {
    cargando = signal(false);
  tipos: TipoEvento[] = [];
  tipoForm: FormGroup;
  theme: 'light' | 'dark' = 'light';
  colores = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ];
  mostrandoFormulario = false;
  editandoTipo: TipoEvento | null = null;

  constructor(private tipoEventoService: TipoEventoService, private fb: FormBuilder) {
    this.tipoForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      descripcion: [''],
      color: [this.colores[0], Validators.required]
    });
    this.setTheme();
  }

  ngOnInit() {
    this.cargarTipos();
  }

  setTheme() {
    this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  cargarTipos() {
    this.cargando.set(true);
    this.tipoEventoService.getTipos().subscribe({
      next: tipos => {
        this.tipos = tipos;
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  nuevoTipo() {
    this.tipoForm.reset({ color: this.colores[0] });
    this.editandoTipo = null;
    this.mostrandoFormulario = true;
  }

  editarTipo(tipo: TipoEvento) {
    this.tipoForm.patchValue(tipo);
    this.editandoTipo = tipo;
    this.mostrandoFormulario = true;
  }

  guardar() {
    if (this.tipoForm.invalid) return;
    const tipo = this.tipoForm.value;
    this.cargando.set(true);
    if (this.editandoTipo && tipo.id) {
      this.tipoEventoService.actualizarTipo(tipo).subscribe({
        next: () => {
          this.cargarTipos();
          this.cancelar();
          this.cargando.set(false);
        },
        error: () => { this.cargando.set(false); }
      });
    } else {
      this.tipoEventoService.crearTipo(tipo).subscribe({
        next: () => {
          this.cargarTipos();
          this.cancelar();
          this.cargando.set(false);
        },
        error: () => { this.cargando.set(false); }
      });
    }
  }

  cancelar() {
    this.tipoForm.reset();
    this.editandoTipo = null;
    this.mostrandoFormulario = false;
  }

  eliminarTipo(tipo: TipoEvento) {
    if (confirm(`¿Eliminar el tipo "${tipo.nombre}"?`)) {
      this.cargando.set(true);
      this.tipoEventoService.eliminarTipo(tipo.id!).subscribe({
        next: () => {
          this.cargarTipos();
          this.cargando.set(false);
        },
        error: () => { this.cargando.set(false); }
      });
    }
  }
}
