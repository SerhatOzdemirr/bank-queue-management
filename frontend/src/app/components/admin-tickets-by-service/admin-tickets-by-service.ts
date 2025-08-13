import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AdminDashboardService,
  ServiceCountItem,
} from "../../services/admin-dashboard.service";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  standalone: true,
  selector: "app-admin-tickets-by-service",
  imports: [CommonModule],
  templateUrl: "./admin-tickets-by-service.html",
  styleUrls: ["./admin-tickets-by-service.css"],
})
export class AdminTicketsByService implements OnInit, OnDestroy {
  private svc = inject(AdminDashboardService);
  private chart?: Chart;
  range = signal<"today" | "7d" | "30d">("7d");

  ngOnInit(): void {
    this.load();
  }
  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  changeRange(r: string) {
    if (r === "today" || r === "7d" || r === "30d") {
      this.range.set(r);
      this.load();
    }
  }
  onRangeChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value as "today" | "7d" | "30d";
    this.changeRange(val);
  }

  private load() {
    this.svc
      .getTicketsByService(this.range())
      .subscribe((data) => this.render(data));
  }

  private render(data: ServiceCountItem[]) {
    const labels = data.map((x) => x.serviceLabel);
    const values = data.map((x) => x.count);

    this.chart?.destroy();
    const ctx = (
      document.getElementById("ticketsByService") as HTMLCanvasElement
    ).getContext("2d")!;
    this.chart = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label: "Tickets", data: values }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }
}
