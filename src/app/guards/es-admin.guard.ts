import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const esAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  if (authService.UsuarioEnSesion.rol === 'admin') {
    return true;
  } else {
    return false;
  }
};

