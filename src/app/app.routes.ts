import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'login', loadComponent: () => import('./components/login/login.component'),

  },
  {
    path: 'register', loadComponent: () => import('./components/register/register.component'),

  },
  {
    path: 'home', loadComponent: () => import('./components/home/home.component'),
    canActivate: [authGuard]

  },
  {
    path: 'lista', loadComponent: () => import('./components/lista-admin/lista-admin.component'),

  },
  {
    path: '404', loadComponent: () => import('./components/notfound/notfound.component'),

  },

];
