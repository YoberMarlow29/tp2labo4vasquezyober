import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnInit {
  email: string = '';
  password: string = ''; // Contraseña fija para todos los usuarios
  users: any[] = [
    { role: 'Administrador', id: 'DuxHl2ZoaHRmAoMUVTDoAdWDeYF2' },
    { role: 'Especialista1', id: '94XwwKtor6ePnqR2HjQF9yuTODp1' },
    { role: 'Especialista2', id: 'PZnJP8xiVKON2FpsBeRLeMGCrBS2' },
    { role: 'Paciente1', id: '3Av7dDdz8XRTdl13I4MLytyHomz2' },
    { role: 'Paciente2', id: 'UAwSOLncBkXYabClw6V3YbgUsYQ2' },
    { role: 'Paciente3', id: 'p0eMyWcVXNf5EOKR3uvUg7hfSAQ2' }
  ];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }
  async loadUserData() {
    for (let user of this.users) {
      try {
        const userData:any = await this.dataService.traerDoc('user', user.id);
        if (userData) {
          user.email = userData.email;
          if (userData.pathFoto && userData.pathFoto.length > 0) {
            user.fotoUrl = await this.storageService.linkDeDescarga(userData.pathFoto[0]);
          }
        }
      } catch (error) {
        console.error(`Error al cargar datos del usuario con ID ${user.id}:`, error);
      }
    }
  }

  async login() {
    try {
      await this.authService.ingresarFireAuth(this.email, this.password);
      this.password='';
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  async quickLogin(userType: string) {
    const user = this.users.find(u => u.role.toLowerCase() === userType);
    if (user) {
      this.email = user.email;
      this.password = '123456';
    }
  }
}
