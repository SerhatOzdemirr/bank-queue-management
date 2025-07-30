// src/app/components/admin-sidebar/admin-sidebar.component.ts
import { Component, inject } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports:[RouterModule],
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css'],
})
export class AdminSidebar {
  private router = inject(Router);
  private auth   = inject(AuthService);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
