import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TipoEventoService } from '../../services/tipo-evento.service';
import { TipoEvento } from '../../modelos/tipo-evento.model';
import { LayoutComponent } from '../layout/layout.component';

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
    LayoutComponent
  ],
  templateUrl: './tipos-evento.component.html',
  styleUrls: ['./tipos-evento.component.scss']
})
export class TiposEventoComponent implements OnInit {
  tipos: TipoEvento[] = [];
  tipoForm: FormGroup;
  theme: 'light' | 'dark' = 'light';

  constructor(private tipoEventoService: TipoEventoService, private fb: FormBuilder) {
    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
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
    this.tipoEventoService.getTipos().subscribe(tipos => this.tipos = tipos);
  }

  guardar() {
    if (this.tipoForm.invalid) return;
    this.tipoEventoService.crearTipo(this.tipoForm.value).subscribe(() => {
      this.cargarTipos();
      this.tipoForm.reset();
    });
  }

  cancelar() {
    this.tipoForm.reset();
  }
}
