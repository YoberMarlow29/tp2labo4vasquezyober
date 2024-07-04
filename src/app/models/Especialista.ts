import { Usuario } from "./Usuario";

export class Especialista extends Usuario {

  especialidad:string[];
  esAceptado:boolean;

  disponibilidad: { [dia: string]: { desde: string, hasta: string }[] };
	constructor(uid: string = '', nombre: string, apellido: string, edad: number,
     dni: number,pathFoto: string[],email: string, contraseña: string,especialidad:string[],esAceptado:boolean=false) {
		super(uid,nombre,apellido,edad,dni,pathFoto,email,contraseña,"especialista");

    this.especialidad=especialidad;
    this.esAceptado=esAceptado;
    this.disponibilidad = {};

	}
}
