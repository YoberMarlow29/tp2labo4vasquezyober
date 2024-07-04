import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { inject } from '@angular/core';
import { Especialista } from '../models/Especialista';

export const pacienteAceptado: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const dataService = inject(DataService);

  const userDoc = await dataService.traerDoc<Especialista>('user', authService.UsuarioEnSesion.uid);

  if(authService.UsuarioEnSesion.rol === 'admin'||authService.UsuarioEnSesion.rol === 'paciente'){

    return true;
  }
  else if (authService.UsuarioEnSesion.rol === 'especialista'&& userDoc.esAceptado==true) {

    return true;
  } else {

    return false;
  }

};
