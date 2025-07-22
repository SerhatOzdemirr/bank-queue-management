import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../services/user'; // servis burada inject edilecek

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [User],
})
export class Login {
  username = '';
  email = '';
  password = '';
  error = '';

  private router = inject(Router);
  private userService = inject(User);

  login() {
    const trimmedUsername = this.username.trim();
    const trimmedEmail = this.email.trim().toLowerCase();
    const trimmedPassword = this.password.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      this.error = 'All fields are required.';
      return;
    }

    const identityKey = this.buildIdentityKey(
      trimmedUsername,
      trimmedEmail,
      trimmedPassword
    );

    // ✅ Sadece farklı kullanıcı, aynı email+password kullanmışsa hata ver
    if (
      this.userService.isEmailOrPasswordTaken(
        trimmedEmail,
        trimmedPassword,
        identityKey
      )
    ) {
      this.error = 'This email or password is already used by another user.';
      return;
    }

    // Kendiyle aynı kimlikse veya ilk kez girişse kabul
    localStorage.setItem('username', trimmedUsername);
    localStorage.setItem('identityKey', identityKey);

    this.router.navigate(['/counter']);
  }

  private buildIdentityKey(
    username: string,
    email: string,
    password: string
  ): string {
    return `${username.toLowerCase()}|${email.toLowerCase()}|${password}`;
  }
}
