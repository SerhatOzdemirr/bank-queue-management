import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { ThemeService } from "../../services/theme.service";
import { ProfileService, ProfileDto } from "../../services/profile.service";
import { environment } from "../../../environment";

@Component({
  standalone: true,
  selector: "app-navbar",
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.css"],
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private themeSvc = inject(ThemeService);
  private profileSvc = inject(ProfileService);

  themes = ["default", "dark"];
  currentTheme = "default";
  menuOpen = false;

  profile?: ProfileDto;

  ngOnInit(): void {
    const saved = this.themeSvc.getTheme();
    this.currentTheme = saved;
    this.themeSvc.setTheme(saved);

    if (this.auth.isLoggedIn()) {
      this.profileSvc.profile$.subscribe(
        (p) => (this.profile = p || undefined)
      );
      this.profileSvc.loadProfile().subscribe();
    }
  }

  applyTheme(theme: string): void {
    this.currentTheme = theme;
    this.themeSvc.setTheme(theme);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }

  toAbs(url?: string | null) {
    if (!url) return "assets/avatar-placeholder.svg";
    const base = environment.apiUrl.replace(/\/api$/, "");
    return url.startsWith("http") ? url : `${base}${url}`;
  }
}
