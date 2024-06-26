import { Component, OnInit } from '@angular/core';
import {  Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Usuario } from '../../models/Usuario';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  userLogged: Usuario | null = null;
  userAdmin: boolean = false;

  constructor(
    private auth: AuthService,
    private data: DataService,
    private route:Router
  ) {}

  ngOnInit(): void {
    this.auth.usuarioEnSesionObs.subscribe(user => {
      this.userLogged = user;
      if (user) {
        this.verificarUsuarioAdmin(user.uid);
      } else {
        this.resetUserState();
      }
    });
  }

  async verificarUsuarioAdmin(uid: string) {
    try {
      const userData = await this.data.traerDoc<Usuario>('user', uid);
      this.userAdmin = userData?.rol === 'admin';
    } catch (error) {
      console.error('Error al verificar si el usuario es administrador:', error);
      this.userAdmin = false;
    }
  }

  resetUserState() {
    this.userLogged = null;
    this.userAdmin = false;
  }


  async verUsuario() {
    const user = await this.auth.currentUser();
    if (user) {
      console.log(`Usuario autenticado: ${user.uid}`);
    } else {
      console.log('No hay usuario autenticado.');
    }
  }
}
