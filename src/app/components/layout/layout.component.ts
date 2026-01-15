import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sidenavMinimizado: boolean = false;
  temaOscuro: boolean = false;

  ngOnInit(): void {
    // Cargar tema guardado
    const temaGuardado = localStorage.getItem('theme') || 'light';
    this.temaOscuro = temaGuardado === 'dark';
    document.documentElement.classList.toggle('dark-theme', this.temaOscuro);

    // Cargar estado del sidebar guardado
    const sidebarMinimizadoGuardado = localStorage.getItem('sidebarMinimizado') === 'true';
    this.sidenavMinimizado = sidebarMinimizadoGuardado;
  }

  onSidebarMinimizadoChange(value: boolean): void {
    this.sidenavMinimizado = value;
    localStorage.setItem('sidebarMinimizado', value.toString());
  }

  onTemaChange(tema: 'light' | 'dark'): void {
    this.temaOscuro = tema === 'dark';
    document.documentElement.classList.toggle('dark-theme', this.temaOscuro);
    localStorage.setItem('theme', tema);
  }
}
