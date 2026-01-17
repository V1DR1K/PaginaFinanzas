import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class SidebarComponent implements OnInit {
  @Input() minimizado: boolean = false;
  @Output() minimizadoChange = new EventEmitter<boolean>();
  @Output() temaChange = new EventEmitter<'light' | 'dark'>();

  temaOscuro: boolean = false;

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/home' },
    { icon: 'paid', label: 'Movimientos', route: '/movimientos' },
    { icon: 'trending_up', label: 'Inversiones', route: '/inversiones' },
    { icon: 'savings', label: 'Ahorros', route: '/ahorros' },
  ];

  ngOnInit(): void {
    const temaGuardado = localStorage.getItem('theme') || 'light';
    this.temaOscuro = temaGuardado === 'dark';
  }

  toggleMinimizado() {
    this.minimizado = !this.minimizado;
    this.minimizadoChange.emit(this.minimizado);
  }

  toggleTema() {
    this.temaOscuro = !this.temaOscuro;
    this.temaChange.emit(this.temaOscuro ? 'dark' : 'light');
  }
}
