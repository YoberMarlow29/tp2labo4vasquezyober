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

  },
  {
    path: 'seccionadmin', loadComponent: () => import('./components/cAdmin/seccion-admin/seccion-admin.component'),
       canActivate: [esAdminGuard],
       ...canActivate(()=> redirectUnauthorizedTo(['/home'])),


  },
  {
    path: '404', loadComponent: () => import('./components/notfound/notfound.component'),

  },
  {
    path: 'miperfil', loadComponent: () => import('./components/cUsuarios/mi-perfil/mi-perfil.component'),
     ...canActivate(()=> redirectUnauthorizedTo(['/home'])),

  },
  {
    path: 'sacarturno', loadComponent: () => import('./components/cTurnos/solicitar-turno/solicitar-turno.component'),
    ...canActivate(()=> redirectUnauthorizedTo(['/home'])),
    canActivate: [noEspecialistaGuard]

  },
  {
    path: 'misturnos', loadComponent: () => import('./components/cTurnos/mis-turnos/mis-turnos.component'),
    ...canActivate(()=> redirectUnauthorizedTo(['/home'])),

  },
  {
    path: 'pacientes', loadComponent: () => import('./components/pacientes/pacientes.component'),

  },
  {
    path: 'usuarios', loadComponent: () => import('./components/cAdmin/usuarios/usuarios.component'),
    canActivate: [esAdminGuard],


  },
  {
    path: 'estadisticas', loadComponent: () => import('./components/cAdmin/estadisticas/estadisticas.component'),
    canActivate: [esAdminGuard],

  },

];
