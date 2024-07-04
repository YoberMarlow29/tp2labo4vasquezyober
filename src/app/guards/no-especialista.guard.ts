import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noEspecialistaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.UsuarioEnSesion.rol === 'admin'||authService.UsuarioEnSesion.rol === 'paciente') {
    return true;
  } else {
    return false;
  }
};
