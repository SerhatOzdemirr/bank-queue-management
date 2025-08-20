import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ProfileService,
  ProfileDto,
  UpdateProfileDto,
} from "../../services/profile.service";
import { environment } from "../../../environment";

@Component({
  selector: "app-profile-header",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile-header.html",
  styleUrls: ["./profile-header.css"], // düzeltildi (styleUrl değil styleUrls)
})
export class ProfileHeader implements OnInit {
  private profilesvc = inject(ProfileService);

  profile?: ProfileDto;
  showEditModal = false;

  editData = {
    name: "",
    email: "",
    password: "",
  };

  ngOnInit() {
    // reactive abone ol
    this.profilesvc.profile$.subscribe((p) => {
      if (p) {
        this.profile = p;
        this.editData.name = p.username;
        this.editData.email = p.email;
      }
    });

    // ilk yükleme
    this.profilesvc.loadProfile().subscribe();
  }

  toAbs(url?: string | null) {
    if (!url) return "assets/avatar-placeholder.svg";
    const base = environment.apiUrl.replace(/\/api$/, "");
    return url.startsWith("http") ? url : `${base}${url}`;
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      console.error("Unsupported image type");
      input.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      console.error("Max 2MB");
      input.value = "";
      return;
    }

    this.profilesvc.uploadAvatar(file).subscribe({
      next: () => {
        // uploadAvatar zaten BehaviorSubject'i güncelliyor
        input.value = "";
      },
      error: (err) => {
        console.error("Upload failed", err);
        input.value = "";
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
        // updateProfile BehaviorSubject'i güncelliyor
        this.closeEditModal();
      },
      error: (err) => console.error("Update failed", err),
    });
  }
}
