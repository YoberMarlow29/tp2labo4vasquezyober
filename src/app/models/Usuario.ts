export abstract class Usuario {
	uid: string;
	nombre: string;
	apellido: string;
	edad: number;
	dni: number;
  pathFoto: string[];
	email: string;
	contraseña: string;
	rol: 'paciente' | 'especialista' | 'admin';


  constructor(
    uid: string,nombre: string,apellido: string,edad: number,dni: number,pathFoto: string[],
    email: string,contraseña: string,rol: 'paciente' | 'especialista' | 'admin') {
    this.uid = uid;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.dni = dni;
    this.pathFoto = pathFoto;
    this.email = email;
    this.contraseña = contraseña;
    this.rol = rol;
  }

}
