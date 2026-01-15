import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() minimizado: boolean = false;
  @Output() minimizadoChange = new EventEmitter<boolean>();
  @Output() temaChange = new EventEmitter<'light' | 'dark'>();

  temaOscuro: boolean = false;

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/home' },
    { icon: 'paid', label: 'Movimientos', route: '/movimientos' },
    { icon: 'savings', label: 'Ahorros', route: '/ahorros' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
  ];

  toggleMinimizado() {
    this.minimizado = !this.minimizado;
    this.minimizadoChange.emit(this.minimizado);
  }

  toggleTema() {
    this.temaOscuro = !this.temaOscuro;
    this.temaChange.emit(this.temaOscuro ? 'dark' : 'light');
  }
}
