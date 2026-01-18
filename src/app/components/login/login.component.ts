import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  usuario = signal('');
  contrasena = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Si ya está autenticado, redirigir al home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.usuario() || !this.contrasena()) {
      this.toastr.warning('Por favor, completa todos los campos', 'Campos requeridos');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({
      usuario: this.usuario(),
      contrasena: this.contrasena()
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastr.success(`Bienvenido ${response.usuario}`, '¡Login exitoso!');
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 100);
      },
      error: (error) => {
        console.error('Error en login:', error);
        const mensaje = error.error?.mensaje || 'Usuario o contraseña incorrectos';
        this.toastr.error(mensaje, 'Error de autenticación');
        this.isLoading.set(false);
        this.contrasena.set('');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onUsuarioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuario.set(input.value);
  }

  onContrasenaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contrasena.set(input.value);
  }
}
