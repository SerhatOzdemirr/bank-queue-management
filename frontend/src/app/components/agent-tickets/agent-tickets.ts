import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AgentService,
  TicketAssignment,
  RouteCandidate,
} from "../../services/agent.service";
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

  showModal = false;
  modalCandidates: RouteCandidate[] = [];
  selectedForRouting: TicketAssignment | null = null;

  routingForTicketId: number | null = null;
  candidates: RouteCandidate[] = [];

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
        this.error = "Assignment list cannot loaded";
        this.loading = false;
      },
    });
  }

  accept(ticket: TicketAssignment) {
    this.agentSvc.accept(ticket.ticketId).subscribe({
      next: () => (ticket.status = "Accepted"),
      error: (err) => (this.error = `Error accept process: ${err.status}`),
    });
  }

  reject(ticket: TicketAssignment) {
    this.agentSvc.reject(ticket.ticketId).subscribe({
      next: () => (ticket.status = "Rejected"),
      error: () => (this.error = "Error reject process"),
    });
  }


  format(dt: string) {
    return this.datePipe.transform(dt, "short") ?? dt;
  }

  trackById(_: number, item: TicketAssignment) {
    return item.ticketId;
  }
  route(ticket: TicketAssignment) {
    const input = prompt("Enter the agent ID to route to:");
    if (!input) return;
    const toAgentId = Number(input);
    if (isNaN(toAgentId) || toAgentId <= 0) {
      this.error = "Invalid agent ID";
      return;
    }

    this.agentSvc.route(ticket.ticketId, toAgentId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(
          (t) => t.ticketId !== ticket.ticketId
        );
      },
      error: (err) => {
        // err.error contains our backend string “Agent does not have the required skill”
        const serverMsg =
          typeof err.error === "string"
            ? err.error
            : "Routing failed. Please try again.";
        this.error = serverMsg;
        // Optionally clear after a few seconds:
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }

  showRoutingList(ticket: TicketAssignment): void {
    this.selectedForRouting = ticket;
    this.agentSvc.getRouteCandidates(ticket.serviceKey).subscribe({
      next: (candidates: RouteCandidate[]) => {
        this.modalCandidates = candidates;
        this.showModal = true;
      },
      error: () => {
        this.error = "Could not load candidates";
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }

  routeTo(ticket: TicketAssignment, toAgentId: number) {
    this.agentSvc.route(ticket.ticketId, toAgentId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(
          (t) => t.ticketId !== ticket.ticketId
        );
        this.closeModal();
      },
      error: (err) => {
        this.error =
          typeof err.error === "string" ? err.error : "Routing failed";
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }

  closeModal() {
    this.showModal = false;
    this.modalCandidates = [];
    this.selectedForRouting = null;
  }

  clearRouting() {
    this.routingForTicketId = null;
    this.candidates = [];
  }
}
