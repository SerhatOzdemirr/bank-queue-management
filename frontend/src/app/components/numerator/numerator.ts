// src/app/components/numerator/numerator.ts
import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { QueueService } from "../../services/queue.service";
import { ServicesService } from "../../services/bank.services";
import { ServiceItem } from "../../services/service-item";

@Component({
  standalone: true,
  selector: "app-numerator-page",
  imports: [CommonModule, FormsModule],
  templateUrl: "./numerator.html",
  styleUrls: ["./numerator.css"],
})
export class Numerator implements OnInit {
  /* ----- adım kontrolü ----- */
  step = 1;
  firstStep(): void {
    this.step = 1;
    this.ticket = null;
  }
  nextStep(): void {
    if (this.step < 3) this.step++;
  }
  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  /* ----- servis listesi & sayfalama ----- */
  services: ServiceItem[] = [];
  selectedService = "";
  page = 1;
  pageSize = 3;
  get pagedServices(): ServiceItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.services.slice(start, start + this.pageSize);
  }
  get totalPages(): number {
    return Math.ceil(this.services.length / this.pageSize);
  }
  goTo(p: number): void {
    this.page = p;
  }
  prevPageNav(): void {
    if (this.page > 1) this.page--;
  }
  nextPageNav(): void {
    if (this.page < this.totalPages) this.page++;
  }

  ticket:
    | {
        number: number;
        serviceKey: string;
        serviceLabel: string;
        takenAt: Date;
      }
    | null = null;

  private queue = inject(QueueService);
  private svcApi = inject(ServicesService);

  ngOnInit(): void {
    this.svcApi.getAll().subscribe({
      next: (list) => {
        this.services = list;
        if (list.length) this.selectedService = list[0].key;
      },
      error: (err) => console.error("Service fetch error", err),
    });
  }

  selectService(item: ServiceItem): void {
    this.selectedService = item.key;
    this.nextStep();
  }

  assignNumber(): void {
    this.queue.getNext(this.selectedService).subscribe({
      next: (res: any) => {
        this.ticket = {
          number: res.number,
          serviceKey: res.serviceKey,
          serviceLabel: res.serviceLabel,
          takenAt: new Date(res.takenAt),
        };
        this.step = 3;
      },
      error: (err) => console.error("Queue error", err),
    });
  }
}
