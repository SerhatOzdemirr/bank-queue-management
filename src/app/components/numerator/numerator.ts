import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
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
  imports: [FormsModule, CommonModule],
  templateUrl: "./numerator.html",
  styleUrls: ["./numerator.css"],
})
export class Numerator implements OnInit {
  step = 1;

  services: ServiceItem[] = [];
  selectedService = "";
  ticket: Ticket | null = null;

  private queue = inject(QueueService);
  private svcApi = inject(ServicesService);

  ngOnInit() {
    this.svcApi.getAll().subscribe(list => {
      this.services = list;
      if (list.length) this.selectedService = list[0].key;
    });
    this.svcApi.getAll().subscribe({
  next: list => { console.log('services', list); this.services = list; },
  error: err => console.error(err)
});

  }

  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  firstStep() {
    this.step = 1;
    this.ticket = null;
  }

  assignNumber() {
    this.queue.getNext(this.selectedService).subscribe(res => {
      const svc = this.services.find(s => s.key === this.selectedService)!;
      this.ticket = {
        number: res.number,
        serviceKey: svc.key,
        serviceLabel: svc.label,
        takenAt: new Date()
      };
      this.step = 3;
    });
  }
}
