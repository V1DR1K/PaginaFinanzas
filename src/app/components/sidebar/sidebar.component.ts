import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() minimizado: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() minimizadoChange = new EventEmitter<boolean>();
  @Output() temaChange = new EventEmitter<'light' | 'dark'>();
  @Output() closeSidebar = new EventEmitter<void>();

  temaOscuro: boolean = false;
  usuarioActual = signal<string | null>(null);
  showUserMenu = signal(false);

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/home' },
    { icon: 'paid', label: 'Movimientos', route: '/movimientos' },
    { icon: 'trending_up', label: 'Inversiones', route: '/inversiones' },
    { icon: 'category', label: 'Categorías', route: '/categorias' },
    { icon: 'event_repeat', label: 'Recurrentes', route: '/recurrentes' },
    { icon: 'auto_awesome', label: 'Insights', route: '/insights' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const temaGuardado = localStorage.getItem('theme') || 'light';
    this.temaOscuro = temaGuardado === 'dark';

    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(usuario => {
      this.usuarioActual.set(usuario);
    });

    // Cerrar sidebar en móvil después de navegar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile) {
        this.closeSidebar.emit();
      }
    });
  }

  toggleMinimizado() {
    this.minimizado = !this.minimizado;
    this.minimizadoChange.emit(this.minimizado);
  }

  toggleTema() {
    this.temaOscuro = !this.temaOscuro;
    this.temaChange.emit(this.temaOscuro ? 'dark' : 'light');
    this.showUserMenu.set(false); // Cerrar el menú después de cambiar tema
    if (this.isMobile) {
      this.closeSidebar.emit();
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  cambiarContrasena() {
    this.showUserMenu.set(false);
    this.router.navigate(['/cambiar-contrasena']);
    if (this.isMobile) {
      this.closeSidebar.emit();
    }
  }

  cerrarSesion() {
    this.showUserMenu.set(false);
    this.authService.logout().subscribe({
      next: () => {
        this.toastr.info('Has cerrado sesión correctamente', 'Hasta pronto');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  onMenuItemClick() {
    if (this.isMobile) {
      this.closeSidebar.emit();
    }
  }
}
