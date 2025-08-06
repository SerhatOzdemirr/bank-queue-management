// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  Router,
  RouterModule,
  ActivatedRoute,
  NavigationEnd,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { AdminSidebar } from "../admin-sidebar/admin-sidebar";
import { filter } from "rxjs/operators";

@Component({
  standalone: true,
  selector: "app-admin-dashboard",
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: "./admin-dashboard.html",
  styleUrls: ["./admin-dashboard.css"],
})
export class AdminDashboard implements OnInit {
  showSidebar = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // İlk yüklemede kontrol et
    this.updateSidebarVisibility();

    // Her navigasyon sonunda tekrar kontrol et
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateSidebarVisibility());
  }

  private updateSidebarVisibility(): void {
    // En derin child route'u bul
    let snapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }

    // Eğer data.hideSidebar === true ise sidebar'ı gizle
    const hide = snapshot.data["hideSidebar"] === true;
    this.showSidebar = !hide;
  }
}
