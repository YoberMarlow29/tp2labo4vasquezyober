import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      await this.authService.ingresarFireAuth(this.email, this.password);
      // Redireccionar a la página principal después del inicio de sesión
      this.router.navigate(['/home']);
      console.log("log con exito");
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Manejar el error como desees (mostrar mensaje, etc.)
    }
  }

  quickLogin(userType: string) {
    // Simular inicio de sesión rápido para diferentes tipos de usuarios
    switch(userType) {
      case 'paciente':
        this.email = 'paciente@paciente.com';
        this.password = '123456';
        break;
      case 'especialista':
        this.email = 'especialista@especialista.com';
        this.password = '123456';
        break;
      case 'administrador':
        this.email = 'admin@admin.com';
        this.password = '123456';
        break;
      default:
        break;
    }
  }
}

