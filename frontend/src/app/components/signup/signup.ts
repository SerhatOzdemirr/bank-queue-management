// src/app/components/signup/signup.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  username = '';
  email = '';
  password = '';
  error = '';

  private router = inject(Router);
  private auth = inject(AuthService);

  signup() {
    if (!this.username || !this.email || !this.password) {
      this.error = 'All fields are required.';
      return;
    }

    this.auth.signup({
      username: this.username.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => this.error = err.error || 'Signup failed.'
    });
  }
}
