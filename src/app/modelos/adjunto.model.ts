export interface Adjunto {
base64: any;
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
