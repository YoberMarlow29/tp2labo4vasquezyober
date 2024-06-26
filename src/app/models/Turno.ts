export class Turno {
  id: string;
  pacienteId: string;
  especialistaId: string;
  especialidad: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado' | 'realizado';
  comentarioCancelacion?: string;
  reseña?: string;
  calificacionAtencion?: number;

  constructor(id: string, pacienteId: string, especialistaId: string, especialidad: string,
              fechaInicio: Date, fechaFin: Date, estado: string,
              comentarioCancelacion?: string, reseña?: string, calificacionAtencion?: number) {
      this.id = id;
      this.pacienteId = pacienteId;
      this.especialistaId = especialistaId;
      this.especialidad = especialidad;
      this.fechaInicio = fechaInicio;
      this.fechaFin = fechaFin;
      this.estado = estado as ('pendiente' | 'aceptado' | 'rechazado' | 'cancelado' | 'realizado');
      this.comentarioCancelacion = comentarioCancelacion;
      this.reseña = reseña;
      this.calificacionAtencion = calificacionAtencion;
  }
}
