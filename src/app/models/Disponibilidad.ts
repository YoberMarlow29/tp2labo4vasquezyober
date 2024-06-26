export class Disponibilidad {
  uid: string;
  especialistaId: string; // ID del especialista
  diaSemana: number; // 0 para domingo, 1 para lunes, etc.
  horarios: { inicio: string; fin: string; }[];

  constructor(
    uid: string,
    especialistaId: string,
    diaSemana: number,
    horarios: { inicio: string; fin: string; }[]
  ) {
    this.uid = uid;
    this.especialistaId = especialistaId;
    this.diaSemana = diaSemana;
    this.horarios = horarios;
  }
}
