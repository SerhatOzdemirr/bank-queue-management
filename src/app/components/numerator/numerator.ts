import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { QueueService } from "../../services/queue.service";
import { ServicesService } from "../../services/bank.services";
import { ServiceItem } from "../../services/service-item";

interface Ticket {
  number: number;
  serviceKey: string;
  serviceLabel: string;
  takenAt: Date;
}

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
  firstStep() {
    this.step = 1;
    this.ticket = null;
  }
  nextStep() {
    if (this.step < 3) this.step++;
  }
  prevStep() {
    if (this.step > 1) this.step--;
  }

  /* ----- servis listesi & sayfalama ----- */
  services: ServiceItem[] = [];
  selectedService = "";
  page = 1;
  pageSize = 3;
  get pagedServices() {
    const start = (this.page - 1) * this.pageSize;
    return this.services.slice(start, start + this.pageSize);
  }
  get totalPages() {
    return Math.ceil(this.services.length / this.pageSize);
  }
  goTo(p: number) {
    this.page = p;
  }
  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  /* ----- bilet ----- */
  ticket: Ticket | null = null;

  private queue = inject(QueueService);
  private svcApi = inject(ServicesService);

  ngOnInit() {
    this.svcApi.getAll().subscribe({
      next: (list) => {
        this.services = list;
        if (list.length) this.selectedService = list[0].key;
      },
      error: (err) => console.error("Service fetch error", err),
    });
  }

  selectService(item: ServiceItem) {
    this.selectedService = item.key;
    this.nextStep();
  }

  assignNumber() {
    this.queue.getNext(this.selectedService).subscribe({
      next: (res) => {
        const svc = this.services.find((s) => s.key === this.selectedService)!;
        this.ticket = {
          number: res.number,
          serviceKey: svc.key,
          serviceLabel: svc.label,
          takenAt: new Date(),
        };
        this.step = 3;
      },
      error: (err) => console.error("Queue error", err),
    });
  }
}
