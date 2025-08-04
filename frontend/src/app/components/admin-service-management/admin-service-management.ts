// src/app/components/admin-service-management/service-management.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../services/admin.service';
import { ServiceItem } from '../../services/service-item';

@Component({
  standalone: true,
  selector: 'app-service-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-service-management.html',
  styleUrls: ['./admin-service-management.css'],
})
export class ServiceManagementComponent implements OnInit {
  services: ServiceItem[] = [];

  /* ---------- Edit modal state ---------- */
  editModalVisible = false;
  private serviceToEdit?: ServiceItem;
  updatedKey = '';
  updatedLabel = '';
  updatedActive = true;
  updatedMax = 100;

  /* ---------- Add modal state ---------- */
  addModalVisible = false;
  addedKey = '';
  addedLabel = '';
  addedActive = true;
  addedMax = 100;

  /* ---------- Dependencies ---------- */
  private readonly adminService = inject(AdminService);

  /* ---------- Lifecycle ---------- */
  ngOnInit(): void {
    this.loadServices();
  }

  /* ---------- Data ---------- */
  private loadServices(): void {
    this.adminService.getServices().subscribe({
      next: list => (this.services = list),
      error: err => console.error('Failed to load services', err),
    });
  }

  /* ---------- Table actions ---------- */
  toggleActive(svc: ServiceItem): void {
    this.adminService
      .updateService(svc.id, {
        serviceKey: svc.serviceKey,
        label: svc.label,
        isActive: !svc.isActive,
        maxNumber: svc.maxNumber,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: err => console.error('Update failed', err),
      });
  }

  setMaxNumber(svc: ServiceItem): void {
    const parsed = parseInt(
      prompt('Set Max Number:', svc.maxNumber.toString()) ?? '',
      10,
    );
    const maxNumber = isNaN(parsed) ? svc.maxNumber : parsed;

    this.adminService
      .updateService(svc.id, {
        serviceKey: svc.serviceKey,
        label: svc.label,
        isActive: svc.isActive,
        maxNumber,
      })
      .subscribe({
        next: () => this.loadServices(),
        error: err => console.error('Set max failed', err),
      });
  }

  deleteService(svc: ServiceItem): void {
    if (!confirm(`Delete service "${svc.label}"?`)) return;
    this.adminService.deleteService(svc.id).subscribe({
      next: () => this.loadServices(),
      error: err => console.error('Delete failed', err),
    });
  }

  /* ---------- Edit modal ---------- */
  showEditModal(svc: ServiceItem): void {
    this.serviceToEdit = svc;
    this.updatedKey = svc.serviceKey;
    this.updatedLabel = svc.label;
    this.updatedActive = svc.isActive;
    this.updatedMax = svc.maxNumber;
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
      })
      .subscribe({
        next: () => {
          this.editModalVisible = false;
          this.loadServices();
        },
        error: err => console.error('Save edit failed', err),
      });
  }

  cancelEdit(): void {
    this.editModalVisible = false;
    this.serviceToEdit = undefined;
  }

  /* ---------- Add modal ---------- */
  showAddModal(): void {
    this.addedKey = '';
    this.addedLabel = '';
    this.addedActive = true;
    this.addedMax = 100;
    this.addModalVisible = true;
    
  }

  saveAdd(): void {
    this.adminService
      .addService({
        serviceKey: this.addedKey.trim(),
        label: this.addedLabel.trim(),
        isActive: this.addedActive,
        maxNumber: this.addedMax,
      })
      .subscribe({
        next: () => {
          this.addModalVisible = false;
          this.loadServices();
        },
        error: err => console.error('Add failed', err),
      });
  }

  cancelAdd(): void {
    this.addModalVisible = false;
  }
}
