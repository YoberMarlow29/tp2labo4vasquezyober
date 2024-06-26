import { Usuario } from "./Usuario";

export class Paciente extends Usuario {


  obraSocial:string;


	constructor(uid: string = '', nombre: string, apellido: string, edad: number,
     dni: number,pathFoto: string[],email: string, contraseña: string,obraSocial:string) {
		super(uid,nombre,apellido,edad,dni,pathFoto,email,contraseña,"paciente");

    this.obraSocial=obraSocial;
	}
}
