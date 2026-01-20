import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { AdjuntoService } from '../../services/adjunto.service';
import { Adjunto } from '../../modelos/adjunto.model';

@Component({
  selector: 'app-adjuntos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './adjuntos-dialog.component.html',
  styleUrls: ['./adjuntos-dialog.component.scss']
})
export class AdjuntosDialogComponent {
    trackAdjunto(index: number, adjunto: Adjunto): number {
      return adjunto.id;
    }
  adjuntos: Adjunto[] = [];
  cargando = false;
  subiendo = false;
  movimientoId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { movimientoId: number },
    private dialogRef: MatDialogRef<AdjuntosDialogComponent>,
    private adjuntoService: AdjuntoService,
    private toastr: ToastrService
  ) {
    this.movimientoId = data.movimientoId;
    this.cargarAdjuntos();
  }

  cargarAdjuntos(): void {
    this.cargando = true;
    this.adjuntoService.getAdjuntos(this.movimientoId).subscribe({
      next: (data) => {
        this.adjuntos = data ?? [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar adjuntos:', error);
        this.toastr.error('Error al cargar los adjuntos', 'Error');
        this.cargando = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.warning('El archivo no puede superar los 5MB', 'Archivo demasiado grande');
      return;
    }

    this.subirAdjunto(file);
  }

  subirAdjunto(file: File): void {
    this.subiendo = true;
    this.adjuntoService.uploadAdjunto(this.movimientoId, file).subscribe({
      next: () => {
        this.toastr.success('Archivo subido correctamente', 'Éxito');
        this.cargarAdjuntos();
        this.subiendo = false;
      },
      error: (error) => {
        console.error('Error al subir archivo:', error);
        this.toastr.error('Error al subir el archivo', 'Error');
        this.subiendo = false;
      }
    });
  }

  descargarAdjunto(adjunto: Adjunto): void {
    this.adjuntoService.downloadAdjunto(this.movimientoId, adjunto.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = adjunto.nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastr.success('Archivo descargado', 'Éxito');
      },
      error: (error) => {
        console.error('Error al descargar:', error);
        this.toastr.error('Error al descargar el archivo', 'Error');
      }
    });
  }

  eliminarAdjunto(adjunto: Adjunto): void {
    if (!confirm(`¿Eliminar el archivo "${adjunto.nombreArchivo}"?`)) {
      return;
    }

    this.adjuntoService.deleteAdjunto(this.movimientoId, adjunto.id).subscribe({
      next: () => {
        this.toastr.success('Archivo eliminado correctamente', 'Éxito');
        this.cargarAdjuntos();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.toastr.error('Error al eliminar el archivo', 'Error');
      }
    });
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getIconoArchivo(nombreArchivo: string): string {
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table_chart';
      default: return 'insert_drive_file';
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
