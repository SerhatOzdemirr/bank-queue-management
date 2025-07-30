// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  standalone: true,
  selector: "app-admin-dashboard",
  imports: [CommonModule, RouterModule],
  templateUrl: "./admin-dashboard.html",
  styleUrls: ["./admin-dashboard.css"],
})
export class AdminDashboard {}
