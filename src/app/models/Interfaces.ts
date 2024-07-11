export interface Especialidad {
  nombre?: string;
}
export interface Turnos {
  id?: string;
  idPaciente?: string;
  nombrePaciente?: string;
  idEspecialista?: string;
  nombreEspecialista?: string;
  especialidad?: string;
  horarioFechaTurno: { fecha: string, desde: string, hasta: string };
  estadoTurno?: 'Pendiente' | 'Aceptado' | 'Cancelado'|'Rechazado'|'Finalizado';
  resena?: string;
  encuesta?: {
    experienciaHospital: 'Excelente' | 'Bueno' | 'Malo' | '';
    recomendarHospital: boolean;
    comentario: string;
    seRealizoEncuesta:boolean,

  };
  calificacion?:{
    puntuacion:number,
    comentarioFin:string,
    seCalifico:boolean,

  }
  historial?:{
    altura: number;
    peso: number;
    temperatura: number;
    presion: number;
    datosDinamicos: Array<{ clave: string, valor: any }>;
    comentario:string,
    seHizoHistorial?:boolean
  }
}

export interface logUser{

  id?:string,
  nombreUsuario?:string,
  diaHorario?: { fecha: string, hora: string };

}
