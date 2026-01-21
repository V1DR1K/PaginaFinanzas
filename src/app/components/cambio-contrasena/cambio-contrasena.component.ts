import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-cambio-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressBar],
  templateUrl: './cambio-contrasena.component.html',
  styleUrl: './cambio-contrasena.component.scss'
})
export class CambioContrasenaComponent {
  contrasenaActual = signal('');
  contrasenaNueva = signal('');
  contrasenaConfirmar = signal('');
  isLoading = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.contrasenaActual() || !this.contrasenaNueva() || !this.contrasenaConfirmar()) {
      this.toastr.warning('Por favor, completa todos los campos', 'Campos requeridos');
      return;
    }

    if (this.contrasenaNueva() !== this.contrasenaConfirmar()) {
      this.toastr.error('Las contraseñas nuevas no coinciden', 'Error de validación');
      return;
    }

    if (this.contrasenaNueva().length < 6) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres', 'Contraseña muy corta');
      return;
    }

    if (this.contrasenaActual() === this.contrasenaNueva()) {
      this.toastr.warning('La nueva contraseña debe ser diferente a la actual', 'Contraseñas iguales');
      return;
    }

    this.isLoading.set(true);

    this.authService.cambiarContrasena({
      contrasenaActual: this.contrasenaActual(),
      contrasenaNueva: this.contrasenaNueva()
    }).subscribe({
      next: (response) => {
        this.toastr.success(response.mensaje, '¡Éxito!');
        this.limpiarFormulario();
        this.isLoading.set(false);
        
        // Volver a la página anterior después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        const mensaje = error.error?.mensaje || 'Error al cambiar la contraseña';
        this.toastr.error(mensaje, 'Error');
        this.isLoading.set(false);
      }
    });
  }

  limpiarFormulario(): void {
    this.contrasenaActual.set('');
    this.contrasenaNueva.set('');
    this.contrasenaConfirmar.set('');
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update(v => !v);
        break;
      case 'new':
        this.showNewPassword.update(v => !v);
        break;
      case 'confirm':
        this.showConfirmPassword.update(v => !v);
        break;
    }
  }

  onContrasenaActualChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contrasenaActual.set(input.value);
  }

  onContrasenaNuevaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contrasenaNueva.set(input.value);
  }

  onContrasenaConfirmarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contrasenaConfirmar.set(input.value);
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' | null {
    const password = this.contrasenaNueva();
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }
}
