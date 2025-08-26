// src/app/components/admin-service-management/service-management.component.ts
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

  // Edit modal state
  editModalVisible = false;
  private serviceToEdit?: ServiceItem;
  updatedKey = "";
  updatedLabel = "";
  updatedActive = true;
  updatedMax = 100;
  updatedPriority = 3;

  // Add modal state
  addModalVisible = false;
  addedKey = "";
  addedLabel = "";
  addedActive = true;
  addedMax = 100;
  addedPriority = 3;

  // Toggle durum kilidi (her servis için)
  activeUpdating: Record<number, boolean> = {};

  // Dependencies
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.adminService.getServices().subscribe({
      next: (list) => {
        this.services = [...list].sort(
          (a, b) => b.priority - a.priority || a.label.localeCompare(b.label)
        );
      },
      error: (err) => console.error("Failed to load services", err),
    });
  }

  // Checkbox toggle: optimistic UI + disable + rollback on error
  onToggleActive(svc: ServiceItem, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    const prev = svc.isActive;

    svc.isActive = checked; // optimistic UI
    this.activeUpdating[svc.id] = true; // input'u kilitle

    this.adminService
      .updateService(svc.id, {
        serviceKey: svc.serviceKey,
        label: svc.label,
        isActive: checked,
        maxNumber: svc.maxNumber,
        priority: svc.priority, // API üzerinde varsa koru
      })
      .subscribe({
        next: () => {
          // İstersen tekrar sırala; tam reload yerine hafif dokunuş:
          this.services = [...this.services].sort(
            (a, b) => b.priority - a.priority || a.label.localeCompare(b.label)
          );
        },
        error: (err) => {
          svc.isActive = prev; // rollback
          console.error("Update failed", err);
        },
      })
      .add(() => {
        this.activeUpdating[svc.id] = false; // kilidi kaldır
      });
  }

  setMaxNumber(svc: ServiceItem): void {
    const parsed = parseInt(
      prompt("Set Max Number:", svc.maxNumber.toString()) ?? "",
      10
    );
    const maxNumber = isNaN(parsed) ? svc.maxNumber : parsed;

    this.adminService
      .updateService(svc.id, {
        serviceKey: svc.serviceKey,
        label: svc.label,
        isActive: svc.isActive,
        maxNumber,
        priority: svc.priority,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error("Set max failed", err),
      });
  }

  deleteService(svc: ServiceItem): void {
    if (!confirm(`Delete service "${svc.label}"?`)) return;
    this.adminService.deleteService(svc.id).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error("Delete failed", err),
    });
  }

  // Edit modal
  showEditModal(svc: ServiceItem): void {
    this.serviceToEdit = svc;
    this.updatedKey = svc.serviceKey;
    this.updatedLabel = svc.label;
    this.updatedActive = svc.isActive;
    this.updatedMax = svc.maxNumber;
    this.updatedPriority = svc.priority;
    this.editModalVisible = true;
  }

  saveEdit(): void {
    if (!this.serviceToEdit) return;

    this.adminService
      .updateService(this.serviceToEdit.id, {
        serviceKey: this.updatedKey.trim(),
        label: this.updatedLabel.trim(),
        isActive: this.updatedActive,
        maxNumber: this.updatedMax,
        priority: this.updatedPriority,
      })
      .subscribe({
        next: () => {
          this.editModalVisible = false;
          this.loadServices();
        },
        error: (err) => console.error("Save edit failed", err),
      });
  }
  cancelEdit(): void {
    this.editModalVisible = false;
    this.serviceToEdit = undefined;
  }
  // Add modal
  showAddModal(): void {
    this.addedKey = "";
    this.addedLabel = "";
    this.addedActive = true;
    this.addedMax = 100;
    this.addedPriority = 3;
    this.addModalVisible = true;
  }
  saveAdd(): void {
    this.adminService
      .addService({
        serviceKey: this.addedKey.trim(),
        label: this.addedLabel.trim(),
        isActive: this.addedActive,
        maxNumber: this.addedMax,
        priority: this.addedPriority,
      })
      .subscribe({
        next: () => {
          this.addModalVisible = false;
          this.loadServices();
        },
        error: (err) => console.error("Add failed", err),
      });
  }
  cancelAdd(): void {
    this.addModalVisible = false;
  }
  trackById(_: number, s: ServiceItem) {
    return s.id;
  }
}
