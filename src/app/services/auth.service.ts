import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Persona } from '../models/Persona';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth : Auth) { }

  async registrarFireAuth(email: string, contr: string){
    try {

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, contr);
     // await sendEmailVerification(userCredential.user);
      return userCredential;
    } catch (error: any) {
      error.message = this.parsearError(error);
      throw error;
    }
  }
  async verificacionEmail(user:any){

        await sendEmailVerification(user.user);
         return user;
  }

  async ingresarFireAuth(email: string, contr: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, contr);

    } catch (error: any) {
      error.message = this.parsearError(error);
      throw error;
    }
  }

  async currentUser(): Promise<Persona | null> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
      }, reject);
    });
  }
   private parsearError(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos estan vacios';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es valido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'No existe ningún usuario con estos identificadores';
        break;
      default:
        message = 'Dirección de email y/o contraseña incorrectos';
        break;
    }

    return message;
  }
}
