import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatIconModule, MatButtonModule, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sidenavMinimizado: boolean = false;
  temaOscuro: boolean = false;
  isMobile: boolean = false;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened: boolean = true;

  ngOnInit(): void {
    // Cargar tema guardado
    const temaGuardado = localStorage.getItem('theme') || 'light';
    this.temaOscuro = temaGuardado === 'dark';
    document.documentElement.classList.toggle('dark-theme', this.temaOscuro);

    // Detectar tamaño de pantalla inicial
    this.checkScreenSize();

    // Cargar estado del sidebar guardado solo en desktop
    if (!this.isMobile) {
      const sidebarMinimizadoGuardado = localStorage.getItem('sidebarMinimizado') === 'true';
      this.sidenavMinimizado = sidebarMinimizadoGuardado;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.sidenavMode = this.isMobile ? 'over' : 'side';
    this.sidenavOpened = !this.isMobile;
  }

  toggleSidenav() {
    this.sidenav.toggle();
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
