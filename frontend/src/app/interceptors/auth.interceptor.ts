// src/app/interceptors/auth.interceptor.ts
import { inject } from "@angular/core";
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
} from "@angular/common/http";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const token = inject(AuthService).getToken();
  const authReq = token
    ? req.clone({
        headers: req.headers.set("Authorization", `Bearer ${token}`),
      })
    : req;
  return next(authReq);
};
