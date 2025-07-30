// src/app/components/service-management/service-management.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../services/admin.service";
import { ServiceItem } from "../../services/service-item";

@Component({
  standalone: true,
  selector: "app-service-management",
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-service-management.html",
  styleUrls: ["./admin-service-management.css"],
})
export class ServiceManagementComponent implements OnInit {
  services: ServiceItem[] = [];
  private adminService = inject(AdminService);

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.adminService.getServices().subscribe({
      next: (list) => (this.services = list),
      error: (err) => console.error("Failed to load services", err),
    });
  }

  openAddService(): void {
    const key = prompt("Service Key:");
    if (!key) return;
    const label = prompt("Service Label:");
    if (!label) return;
    const maxStr = prompt("Max Number:", "100");
    const maxNumber = maxStr ? parseInt(maxStr, 10) : 100;

    this.adminService
      .addService({ key, label, isActive: true, maxNumber })
      .subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error("Add failed", err),
      });
  }

  toggleActive(svc: ServiceItem): void {
    this.adminService
      .updateService(svc.id, {
        ...svc,
        isActive: !svc.isActive,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error("Update failed", err),
      });
  }

  editService(svc: ServiceItem): void {
    const label = prompt("New Label:", svc.label);
    if (label == null) return;
    this.adminService
      .updateService(svc.id, {
        ...svc,
        label,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error("Edit failed", err),
      });
  }

  deleteService(svc: ServiceItem): void {
    if (!confirm(`Delete service "${svc.label}"?`)) return;
    this.adminService.deleteService(svc.id).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error("Delete failed", err),
    });
  }

  setMaxNumber(svc: ServiceItem): void {
    const maxStr = prompt("Set Max Number:", svc.maxNumber?.toString() ?? "0");
    const maxNumber = maxStr ? parseInt(maxStr, 10) : svc.maxNumber;
    if (isNaN(maxNumber)) return;

    this.adminService
      .updateService(svc.id, {
        ...svc,
        maxNumber,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error("Set max failed", err),
      });
  }
}
