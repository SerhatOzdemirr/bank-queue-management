import { Component, inject } from '@angular/core';
import { User } from '../../services/user';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-counter-page',
  templateUrl: './counter.html',
  styleUrl: './counter.css',
  imports: [CommonModule],
  providers: [User],
})
export class Counter {
  number: number | null = null;
  username = localStorage.getItem('username') || '';
  identityKey = localStorage.getItem('identityKey') || '';
  userService = inject(User);

  assignNumber() {
    this.number = this.userService.assignNumber(this.identityKey);
  }
}
