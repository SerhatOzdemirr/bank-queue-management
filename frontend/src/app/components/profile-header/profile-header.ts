import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.css'
})
export class ProfileHeader {
  showEditModal = false;

  editData = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveProfile() {
    console.log('Updated profile:', this.editData);
    this.closeEditModal();
  }
}
