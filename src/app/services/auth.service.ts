import { Injectable } from '@angular/core';
import { User as FireUser,Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, getAuth, } from '@angular/fire/auth';
import { DataService } from './data.service';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/Usuario';
import { Admin } from '../models/Administrador';
import { Especialista } from '../models/Especialista';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioEnSesionObs = this.userSubject.asObservable();

  constructor(public auth: Auth, private dataService: DataService, private router: Router) {
    const storedUser = sessionStorage.getItem('usuario');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  public get UsuarioEnSesion(): Usuario | null {
    return this.userSubject.getValue();
  }

  public set UsuarioEnSesion(value: Usuario | null) {
    if (value) {
      sessionStorage.setItem('usuario', JSON.stringify(value));
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        sessionStorage.setItem('fireUser', JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem('fireUser');
      }
    } else {
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('fireUser');
      this.auth.signOut().catch(error => console.error('Error signing out:', error));
    }
    this.userSubject.next(value);
  }

  async currentUser() {
    return this.auth.currentUser;
  }

  async logout() {
    await this.auth.signOut();
    this.UsuarioEnSesion = null; // Asegurar que el usuario en sesión se actualice a null
    sessionStorage.clear(); // Limpiar sessionStorage
  }

  async registrarFireAuth(coleccion: string, usuario: Usuario, contr: string) {
    try {

      const ssFireUser = sessionStorage.getItem('fireUser');
      const fireUserViejo: FireUser | null = ssFireUser ? JSON.parse(ssFireUser) : null;

      const authInst = !fireUserViejo ? this.auth : getAuth(initializeApp({
        "projectId":"segundotplabo",
        "appId":"1:937951349338:web:c9464e0b996b5e6eec6663",
        "storageBucket":"segundotplabo.appspot.com",
        "apiKey":"AIzaSyAIeqmWSbVqWF-McCSRFC--LrZyJ2rPyWo",
        "authDomain":"segundotplabo.firebaseapp.com",
        "messagingSenderId":"937951349338"}, "Secondary"));
      const userCredential = await createUserWithEmailAndPassword(authInst, usuario.email, contr);
      const user = userCredential.user;
      usuario.uid = user.uid;
      await this.dataService.subirDoc(coleccion, usuario, user.uid);
      await sendEmailVerification(user);
      this.UsuarioEnSesion = usuario;
      if (!fireUserViejo)
        this.UsuarioEnSesion = usuario;
      Swal.fire('Éxito', 'Registro exitoso. Por favor, verifica tu correo electrónico.', 'success');
      return userCredential;
    } catch (error: any) {
      const errorMessage = this.parsearError(error.code);
      Swal.fire('Error', errorMessage, 'error');
      throw error;
    }
  }

  async ingresarFireAuth(email: string, contr: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, contr);
      const user = userCredential.user;
      const userDoc = await this.dataService.traerDoc<Usuario>('user', user.uid);

      if (!user.emailVerified) {
        Swal.fire('Error', 'Debe verificar su correo electrónico para acceder.', 'error');
        await this.logout();
        this.router.navigate(['/login']);
      } else if (userDoc instanceof Especialista && !userDoc.esAceptado) {
        Swal.fire('Error', 'Por favor, contacte con un administrador para que acepten su cuenta.', 'error');
        await this.logout();
        this.router.navigate(['/login']);
      } else {
        Swal.fire('Éxito', 'Inicio de sesión exitoso.', 'success');
        this.UsuarioEnSesion = userDoc;
        this.router.navigate(['/home']);
      }
      return userCredential;
    } catch (error: any) {
      const errorMessage = this.parsearError(error.code);
      Swal.fire('Error', errorMessage, 'error');
      throw error;
    }
  }

  private parsearError(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos están vacíos';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es válido.';
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
