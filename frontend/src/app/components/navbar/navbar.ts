import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";

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

  themes = ["default","dark"];
  currentTheme = "default";

  ngOnInit(): void {
    this.onPageLoadOrRefresh();
    const saved = localStorage.getItem("theme");
    if (saved && this.themes.includes(saved)) {
      this.applyTheme(saved);
    }
  }
  private onPageLoadOrRefresh(): void {
    localStorage.setItem("theme", "default");
    const savedGet = localStorage.getItem("theme");
    if (savedGet && this.themes.includes(savedGet)) {
      this.applyTheme(savedGet);
    }

    console.log("Sayfa yüklendi veya yenilendi!");
  }
  applyTheme(theme: string): void {
    // önce tüm tema sınıflarını kaldır
    this.themes
      .filter((t) => t !== "default")
      .forEach((t) => document.body.classList.remove(`theme-${t}`));

    // default değilse seçili temayı ekle
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    this.currentTheme = theme;
    localStorage.setItem("theme", theme);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }
  
}
