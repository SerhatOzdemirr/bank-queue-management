import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ProfileService, ProfileDto , UpdateProfileDto } from "../../services/profile.service";

@Component({
  selector: "app-profile-header",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile-header.html",
  styleUrl: "./profile-header.css",
})
export class ProfileHeader implements OnInit {
  private profilesvc = inject(ProfileService);

  profile?: ProfileDto;
  showEditModal = false;

  editData = {
    name: "",
    email: "",
    password : ""
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profilesvc.getProfileInfo().subscribe({
      next: (data) => {
        this.profile = data;
        // Edit form başlangıç değerlerini set et
        this.editData.name = data.username;
        this.editData.email = data.email;
      },
      error: (err) => {
        console.error("Profile load error", err);
      },
    });
  }

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveProfile() {
    const updateData: UpdateProfileDto = {
      username: this.editData.name,
      email: this.editData.email,
      password: this.editData.password || null, 
    };

    this.profilesvc.updateProfile(updateData).subscribe({
      next: () => {
        this.profile!.username = updateData.username;
        this.profile!.email = updateData.email;
        this.closeEditModal();
      },
      error: (err) => {
        console.error("Update failed", err);
      },
    });
  }
}
