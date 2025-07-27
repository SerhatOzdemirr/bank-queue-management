// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, authMatchGuard } from './guards/auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then(m => m.Signup)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'numerator',
    canActivate: [authGuard],
    canMatch: [authMatchGuard],
    loadComponent: () => import('./components/numerator/numerator').then(m => m.Numerator)
  },
  { path: '**', redirectTo: 'signup' }
];