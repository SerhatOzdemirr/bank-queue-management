// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }        from '@angular/router';

import { App }             from './app/app';
import { routes }          from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor'; // fonksiyon

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([authInterceptor])  // ← fonksiyonu burada ver
    )
  ]
});
