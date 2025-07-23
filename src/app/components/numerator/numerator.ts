import { Component, inject } from '@angular/core';
import { User } from '../../services/user';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-numerator-page',
  templateUrl: './numerator.html',
  styleUrl: './numerator.css',
  imports: [CommonModule],
  providers: [User],
})
export class Numerator {
  number: number | null = null;
  username = localStorage.getItem('username') || '';
  identityKey = localStorage.getItem('identityKey') || '';
  userService = inject(User);

  assignNumber() {
    this.number = this.userService.assignNumber(this.identityKey);
  }
}
