// src/app/services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environment";

@Injectable({ providedIn: "root" })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  signup(dto: { username: string; email: string; password: string }) {
    return this.http.post(`${this.base}/signup`, dto);
  }

  signupAdmin(dto: { username: string; email: string; password: string }) {
    return this.http.post(`${this.base}/signup-admin`, dto);
  }

  login(dto: { email: string; password: string }) {
    // auth.service.ts -> login()
    return this.http.post<{ token: string }>(`${this.base}/login`, dto).pipe(
      tap((res) => {
        const t = res.token;
        console.log("TOKEN:", t.slice(0, 24), "...");
        try {
          localStorage.setItem("token", t);
          console.log(
            "AFTER SET getItem:",
            localStorage.getItem("token")?.slice(0, 24)
          );
          setTimeout(() => {
            console.log(
              "500ms LATER getItem:",
              localStorage.getItem("token")?.slice(0, 24)
            );
          }, 500);
        } catch (e) {
          console.error("LS ERROR:", e);
        }
      })
    );
  }

  /** interceptor için */
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  /** token içinden role’u oku */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // bazen "role" bazen uzun URI altında olabilir
      return (
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload["role"] ||
        null
      );
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === "Admin";
  }
  isAgent(): boolean {
    return this.getRole() === "Agent";
  }

  logout(): void {
    localStorage.removeItem("token");
    this.router.navigate(["/login"]);
  }
}
