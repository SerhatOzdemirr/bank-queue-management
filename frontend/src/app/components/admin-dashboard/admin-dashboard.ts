// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AdminSidebar } from "../admin-sidebar/admin-sidebar";

@Component({
  standalone: true,
  selector: "app-admin-dashboard",
  imports: [CommonModule, RouterModule,AdminSidebar],
  templateUrl: "./admin-dashboard.html",
  styleUrls: ["./admin-dashboard.css"],
})
export class AdminDashboard {}
