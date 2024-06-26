import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { inject } from '@angular/core';
import { Especialista } from '../models/Especialista';

export const pacienteAceptado: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const dataService = inject(DataService);

  const currentUser = await authService.currentUser();
  if (!currentUser) {
    return false;
  }
  const userDoc = await dataService.traerDoc<Especialista>('user', currentUser.uid);

  if(userDoc.rol=="admin"|| userDoc.rol=="paciente"){

    return true;
  }
  else if (userDoc && userDoc.rol=== 'especialista'&& userDoc.esAceptado==true) {

    return true;
  } else {

    return false;
  }

};
