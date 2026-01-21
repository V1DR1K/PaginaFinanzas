import { Component, OnInit, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { Evento } from '../../modelos/evento.model';
import { TipoEvento } from '../../modelos/tipo-evento.model';
import { AuthService } from '../../services/auth.service';
import { EventoService } from '../../services/evento.service';
import { TipoEventoService } from '../../services/tipo-evento.service';
import { LayoutComponent } from '../layout/layout.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-eventos-recordatorio',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LayoutComponent,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule,
    MatTableModule, MatSortModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatButtonModule,
    MatProgressBar
],
  providers: [DatePipe],
  templateUrl: './eventos-recordatorio.component.html',
  styleUrls: ['./eventos-recordatorio.component.scss']
})
export class EventosRecordatorioComponent implements OnInit, AfterViewInit {
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  tipos: TipoEvento[] = [];
  theme: 'light' | 'dark' = 'light';
  eventoSeleccionado: Evento | null = null;
  cargando = signal(false);
  filtroTipoId: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private eventoService: EventoService,
    private tipoEventoService: TipoEventoService
  ) {
    this.setTheme();
  }

  ngOnInit() {
    this.cargarEventos();
    this.cargarTipos();
  }

  setTheme() {
    this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  nuevoEvento(): Evento {
    return { fecha: new Date(), descripcion: '', usuario: '', tipoId: undefined };
  }

  cargarEventos() {
    this.cargando.set(true);
    this.eventoService.getEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        this.filtrarEventos();
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); }
    });
  }

  cargarTipos() {
    this.tipoEventoService.getTipos().subscribe(tipos => this.tipos = tipos);
  }

  filtrarEventos() {
    if (!this.filtroTipoId) {
      this.eventosFiltrados = [...this.eventos];
    } else {
      this.eventosFiltrados = this.eventos.filter(e => e.tipoId === this.filtroTipoId);
    }
    if (this.sort && (this.eventosFiltrados as any).sortData) {
      (this.eventosFiltrados as any).sort = this.sort;
    }
  }

  ngAfterViewInit() {
    if (this.sort && (this.eventosFiltrados as any).sortData) {
      (this.eventosFiltrados as any).sort = this.sort;
    }
  }

  guardarEvento() {
    if (!this.eventoSeleccionado || !this.eventoSeleccionado.descripcion || !this.eventoSeleccionado.fecha || !this.eventoSeleccionado.tipoId) return;
    this.cargando.set(true);
    this.eventoService.crearEvento(this.eventoSeleccionado).subscribe({
      next: (evento) => {
        this.eventos.push(evento);
        this.filtrarEventos();
        this.eventoSeleccionado = null;
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); }
    });
  }

  editarEvento(evento: Evento) {
    this.eventoSeleccionado = { ...evento };
  }

  cancelarEdicion() {
    this.eventoSeleccionado = null;
  }

  getTipoNombre(tipoId?: string): string {
    return this.tipos.find(t => t.id === tipoId)?.nombre || '';
  }

  getTipoColor(tipoId?: string): string {
    const tipo = this.tipos.find(t => t.id === tipoId);
    if (!tipo) return '#bdbdbd';
    return tipo.color || '#bdbdbd';
  }
}
