export interface Especialidad {
  nombre?: string;
}
export interface Turnos {
  especialidad?: string;
  reseña?: string;
  paciente?: string;
  especialista?: string;
  horarioFechaTurno: { fecha: string, desde: string, hasta: string };
  estadoTurno?: 'pendiente' | 'aceptado' | 'cancelado' | 'rechazado' | 'finalizado';
  comentarioCancelacion?: string;
  comentarioRechazo?: string;
  comentarioFinalizacion?: string;
  encuesta?: string;
  calificacion?: number;
}
