import { Routes } from '@angular/router';
import { pacienteAceptado } from './guards/PacienteAceptado.guard';
import {canActivate,redirectUnauthorizedTo,redirectLoggedInTo } from "@angular/fire/auth-guard"
import { esAdminGuard } from './guards/es-admin.guard';
import { noEspecialistaGuard } from './guards/no-especialista.guard';

export const routes: Routes = [

  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'login', loadComponent: () => import('./components/cUsuarios/login/login.component'),
      ...canActivate(()=> redirectLoggedInTo(['/home'])),

  },
  {
    path: 'register', loadComponent: () => import('./components/cUsuarios/register/register.component'),
       ...canActivate(()=> redirectLoggedInTo(['/home'])),

  },
  {
    path: 'home', loadComponent: () => import('./components/home/home.component'),
       canActivate: [pacienteAceptado]

  },
  {
    path: 'seccionadmin', loadComponent: () => import('./components/cAdmin/seccion-admin/seccion-admin.component'),
       canActivate: [esAdminGuard]

  },
  {
    path: '404', loadComponent: () => import('./components/notfound/notfound.component'),

  },
  {
    path: 'miperfil', loadComponent: () => import('./components/cUsuarios/mi-perfil/mi-perfil.component'),


  },
  {
    path: 'sacarturno', loadComponent: () => import('./components/cTurnos/solicitar-turno/solicitar-turno.component'),
    ...canActivate(()=> redirectLoggedInTo(['/home'])),
    canActivate: [noEspecialistaGuard]

  },

];
