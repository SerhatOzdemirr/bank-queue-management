// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface SignupDto { username: string; email: string; password: string; }
interface LoginDto  { email:    string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  signup(dto: SignupDto): Observable<any> {
    return this.http.post(`${this.base}/signup`, dto);
  }

  login(dto: LoginDto) {
    return this.http.post<{ token: string }>(
      `${this.base}/login`, dto
    ).pipe(
      tap(res => localStorage.setItem('token', res.token))  // token saklama
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
