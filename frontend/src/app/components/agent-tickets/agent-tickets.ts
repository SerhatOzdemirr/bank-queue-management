import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgentService, TicketAssignment } from "../../services/agent.service";
import { DatePipe } from "@angular/common";

@Component({
  standalone: true,
  selector: "app-agent-tickets",
  imports: [CommonModule],
  templateUrl: "./agent-tickets.html",
  styleUrls: ["./agent-tickets.css"],
  providers: [DatePipe],
})
export class AgentTickets implements OnInit {
  tickets: TicketAssignment[] = [];
  loading = false;
  error: string | null = null;

  private agentSvc = inject(AgentService);
  private datePipe = inject(DatePipe);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.agentSvc.getMyTickets().subscribe({
      next: (list) => {
        this.tickets = list;
        this.loading = false;
      },
      error: () => {
        this.error = "Atama listesi yüklenemedi";
        this.loading = false;
      },
    });
  }

  accept(ticket: TicketAssignment) {
    this.agentSvc.accept(ticket.ticketId).subscribe({
      next: () => ticket.status = "Accepted",
      error: (err) => this.error = `Kabul işleminde hata: ${err.status}`,
    });
  }

  reject(ticket: TicketAssignment) {
    this.agentSvc.reject(ticket.ticketId).subscribe({
      next: () => ticket.status = "Rejected",
      error: () => this.error = "Reddetme işleminde hata",
    });
  }

  release(ticket: TicketAssignment) {
    this.agentSvc.release(ticket.ticketId).subscribe({
      next: () => this.tickets = this.tickets.filter(t => t.ticketId !== ticket.ticketId),
      error: () => this.error = "Serbest bırakma işleminde hata",
    });
  }

  format(dt: string) {
    return this.datePipe.transform(dt, "short") ?? dt;
  }

  trackById(_: number, item: TicketAssignment) {
    return item.ticketId;
  }
}
