// src/app/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  error = '';

  private router = inject(Router);
  private auth = inject(AuthService);

  login() {
    if (!this.email || !this.password) {
      this.error = 'All fields are required.';
      return;
    }

    this.auth.login({
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/numerator']),
      error: err => this.error = err.error || 'Login failed.'
    });
  }
}
