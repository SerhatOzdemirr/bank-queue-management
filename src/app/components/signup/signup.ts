import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { User } from "../../services/user";

@Component({
  standalone: true,
  selector: "app-signup",
  imports: [FormsModule, CommonModule],
  templateUrl: "./signup.html",
  styleUrl: "./signup.css",
  providers: [User],
})
export class Signup {
  username = "";
  email = "";
  password = "";
  error = "";

  private router = inject(Router);
  private userService = inject(User);

  signup() {
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

    this.userService.registerUser(identityKey);
    this.router.navigate(["/login"]); // login sayfasına yönlendir
  }

  private buildIdentityKey(username: string, email: string, password: string): string {
    return `${username.toLowerCase()}|${email.toLowerCase()}|${password}`;
  }
}
