import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { User } from "../../services/user";

@Component({
  standalone: true,
  selector: "app-login",
  imports: [FormsModule, CommonModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
  providers: [User],
})
export class Login {
  username = "";
  email = "";
  password = "";
  error = "";

  private router = inject(Router);
  private userService = inject(User);

  login() {
    const u = this.username.trim();
    const e = this.email.trim().toLowerCase();
    const p = this.password.trim();

    if (!u || !e || !p) {
      this.error = "All fields are required.";
      return;
    }

    const identityKey = this.buildIdentityKey(u, e, p);

    const isRegistered = this.userService.isRegistered(identityKey);

    if (!isRegistered) {
      this.error = "User not found. Please sign up first.";
      return;
    }

    localStorage.setItem("username", u);
    localStorage.setItem("identityKey", identityKey);
    this.router.navigate(["/counter"]);
  }

  private buildIdentityKey(username: string, email: string, password: string): string {
    return `${username.toLowerCase()}|${email.toLowerCase()}|${password}`;
  }
}
