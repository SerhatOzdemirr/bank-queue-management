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
  styleUrl: "./profile-header.css",
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
    this.loadProfile();
  }

  toAbs(url?: string | null) {
    if (!url) return "assets/avatar-placeholder.svg";
    // url backend’den "/avatars/xxx.png" geliyor
    const base = environment.apiUrl.replace(/\/api$/, ""); // sondaki /api'yi sil
    return url.startsWith("http") ? url : `${base}${url}`;
  }

  // 👇 EKSİK OLAN METOT
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // basit tip / boyut kontrolü
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
      next: (res) => {
        if (this.profile) {
          // API { url, relativeUrl } döndürüyor
          this.profile.avatarUrl =
            res?.relativeUrl || res?.url || this.profile.avatarUrl;
        }
        input.value = ""; // aynı dosyayı tekrar seçebilmek için sıfırla
      },
      error: (err) => {
        console.error("Upload failed", err);
        input.value = "";
      },
    });
  }

  loadProfile() {
    this.profilesvc.getProfileInfo().subscribe({
      next: (data) => {
        this.profile = data;
        this.editData.name = data.username;
        this.editData.email = data.email;
      },
      error: (err) => console.error("Profile load error", err),
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
        if (this.profile) {
          this.profile.username = updateData.username;
          this.profile.email = updateData.email;
        }
        this.closeEditModal();
      },
      error: (err) => console.error("Update failed", err),
    });
  }
}
