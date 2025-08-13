// src/app/components/admin-agent-status-chart/admin-agent-status-chart.ts
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgentActivitySummaryDto } from "../../services/admin-agent-activity.service";
import { AdminActivityService } from "../../services/admin-agent-activity.service";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title);

@Component({
  standalone: true,
  selector: "app-admin-agent-status-chart",
  imports: [CommonModule],
  templateUrl: "./admin-agent-status-chart.html",
  styleUrls: ["./admin-agent-status-chart.css"],
})
export class AdminAgentStatusChart implements OnInit, OnChanges, OnDestroy {
  /** Opsiyonel: parent data verirse onu kullanır, vermezse kendi çeker */
  @Input() data: AgentActivitySummaryDto[] | null = null;

  @ViewChild("canvas", { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private activitySvc: AdminActivityService) {}

  ngOnInit(): void {
    // Input yoksa veya boşsa kendi verisini çeksin
    if (!this.data || this.data.length === 0) {
      this.activitySvc.get("7d", 50).subscribe((d) => {
        this.data = d;
        this.render();
      });
    } else {
      this.render();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"] && !changes["data"].firstChange) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const list = this.data ?? [];
    const totalAccepted = list.reduce((s, x) => s + x.accepted, 0);
    const totalRejected = list.reduce((s, x) => s + x.rejected, 0);
    const totalPending = list.reduce((s, x) => s + x.pending, 0);

    this.chart?.destroy();
    const ctx = this.canvas.nativeElement.getContext("2d")!;
    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Accepted", "Rejected", "Pending"],
        datasets: [
          {
            label: "Tickets",
            data: [totalAccepted, totalRejected, totalPending],
            backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Agent Status Share",
            font: { size: 16, weight: "bold" },
          },
        },
      },
    });
  }
}
