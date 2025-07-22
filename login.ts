import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { User } from "../../services/user"; // servis burada inject edilecek

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

    const emailTaken = this.userService.isEmailTaken(e, identityKey);

    if (emailTaken) {
      this.error = "This email has already been used by another user.";
      return;
    }


    // Eğer buraya geldiyseniz ne email ne şifre çakışıyor:
    localStorage.setItem("username", u);
    localStorage.setItem("identityKey", identityKey);
    this.router.navigate(["/counter"]);
  }

  private buildIdentityKey(
    username: string,
    email: string,
    password: string
  ): string {
    return `${username.toLowerCase()}|${email.toLowerCase()}|${password}`;
  }
}
