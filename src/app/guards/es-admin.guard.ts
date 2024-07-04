import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { inject } from '@angular/core';
import { Usuario } from '../models/Usuario';

export const esAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  if (authService.UsuarioEnSesion.rol === 'admin') {
    return true;
  } else {
    return false;
  }
};

