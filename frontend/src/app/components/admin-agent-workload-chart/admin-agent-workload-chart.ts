import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgentActivitySummaryDto, AdminActivityService } from "../../services/admin-agent-activity.service";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

@Component({
  standalone: true,
  selector: "app-admin-agent-workload-chart",
  imports: [CommonModule],
  templateUrl: "./admin-agent-workload-chart.html",
  styleUrls: ["./admin-agent-workload-chart.css"],
})
export class AdminAgentWorkloadChart implements OnInit, OnChanges, OnDestroy {
  /** Opsiyonel: parent data verirse onu kullanır, vermezse kendi çeker */
  @Input() data: AgentActivitySummaryDto[] | null = null;

  @ViewChild("canvas", { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private activitySvc: AdminActivityService) {}

  ngOnInit(): void {
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
    const labels = list.map((x) => x.agentName);
    const accepted = list.map((x) => x.accepted);
    const rejected = list.map((x) => x.rejected);
    const pending = list.map((x) => x.pending);

    this.chart?.destroy();
    const ctx = this.canvas.nativeElement.getContext("2d")!;
    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Accepted", data: accepted, backgroundColor: "#4caf50" },
          { label: "Rejected", data: rejected, backgroundColor: "#f44336" },
          { label: "Pending", data: pending, backgroundColor: "#ff9800" }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
        },
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Agent Workload Distribution",
            font: { size: 16, weight: "bold" },
          },
        },
      },
    });
  }
}