import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { ThemeService } from "../../services/theme.service";

@Component({
  standalone: true,
  selector: "app-navbar",
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.css"],
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  menuOpen = false;
  private router = inject(Router);
  private themeSvc = inject(ThemeService);

  themes = ["default", "dark"];
  currentTheme = "default";

  ngOnInit(): void {
    const saved = this.themeSvc.getTheme();
    this.currentTheme = saved;
    this.themeSvc.setTheme(saved);
  }

  applyTheme(theme: string): void {
    this.currentTheme = theme;
    this.themeSvc.setTheme(theme);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }
}
