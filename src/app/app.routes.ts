import { Routes } from '@angular/router';

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

  },

];
