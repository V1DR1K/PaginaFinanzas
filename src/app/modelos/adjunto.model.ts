export interface Adjunto {
  id: number;
  movimientoId: number;
  nombreArchivo: string;
  tipoArchivo: string;
  tamano: number;
  tamanoBytes: number;
  url: string;
  fechaSubida: string;
}

export interface AdjuntoUploadResponse {
  mensaje: string;
  adjunto: Adjunto;
}
