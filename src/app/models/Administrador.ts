import { Usuario } from "./Usuario";

export class Admin extends Usuario {
	constructor(uid: string = '', nombre: string, apellido: string, edad: number,
     dni: number,pathFoto: string[],email: string, contraseña: string) {
		super(uid,nombre,apellido,edad,dni,pathFoto,email,contraseña,"admin");
	}
}
