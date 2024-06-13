export interface Persona {
  uid?:string,
  nombre?: string;
  apellido?: string;
  edad?: string;
  dni?: number;
  obraSocial?: string;
  mail?: string;
  especialidad?: string;
  pathFoto?: string[];
  esAdmin?:boolean;
  esAceptado?:boolean;
  id?:string;
}
