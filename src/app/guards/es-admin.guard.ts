import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { inject } from '@angular/core';
import { Usuario } from '../models/Usuario';

export const esAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const dataService = inject(DataService);

  const currentUser = await authService.currentUser();
  if (!currentUser) {
    return false;
  }

  const userDoc = await dataService.traerDoc<Usuario>('user', currentUser.uid);

  if (userDoc && userDoc.rol === 'admin') {
    return true;
  } else {
    return false;
  }
};

