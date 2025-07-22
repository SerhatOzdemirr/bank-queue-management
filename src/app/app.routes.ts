import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/login/login').then(m => m.Login) },
  { path: 'counter', loadComponent: () => import('./components/counter/counter').then(m => m.Counter) },
];
