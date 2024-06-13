import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { inject } from '@angular/core';
import { Persona } from '../models/Persona';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const dataService = inject(DataService);
  const router = inject(Router);

  const user = await authService.currentUser(); // Asegúrate de que AuthService tenga un método para obtener el usuario actual
  if (user) {
    const userData = await dataService.traerDoc<Persona>('especialistas', user.uid); // Ajusta la colección según tu estructura

    if(user.uid==userData.uid&&userData.esAceptado==true){
      router.navigate(['/home']);

      return true;
    }
    else{

      return false;
    }
    // console.log(userData)
    // if (userData && userData.esAceptado==true) {
    //   return true;
    // } else {
    //   router.navigate(['/home']); // Redirige a la página que prefieras
    //   return false;
    // }
  } else {
    router.navigate(['/login']);
    return false;
  }
};
