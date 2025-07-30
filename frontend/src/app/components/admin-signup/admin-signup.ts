// src/app/components/admin-signup/admin-signup.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-signup.html',
  styleUrls: ['./admin-signup.css']
})
export class AdminSignup {
  username = '';
  email = '';
  password = '';
  error = '';
  success = '';

  private router = inject(Router);
  private auth    = inject(AuthService);

  createAdmin() {
    this.error   = '';
    this.success = '';

    if (!this.username || !this.email || !this.password) {
      this.error = 'All fields are required.';
      return;
    }

    this.auth.signupAdmin({
      username: this.username.trim(),
      email:    this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']),
        this.success = 'New admin created successfully.';
        this.username = this.email = this.password = '';
      },
      error: err => this.error = err.error || 'Admin creation failed.'
    });
  }
}
