import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/signup/signup').then(m => m.Signup) },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.Login) },
  { path: 'numerator', loadComponent: () => import('./components/numerator/numerator').then(m => m.Numerator) },
];
