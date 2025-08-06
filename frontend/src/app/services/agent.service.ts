import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment";
import { Ticket } from "./admin.service";

export interface TicketAssignment {
  ticketId: number;
  number: number;
  serviceKey: string;
  serviceLabel: string;
  takenAt: string;
  assignedAt: string;
  status: "Pending" | "Accepted" | "Rejected";
  priority: number;
  username: string;
}
export interface RouteCandidate {
  agentId: number;
  username: string;
}
@Injectable({ providedIn: "root" })
export class AgentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/agent/tickets`;

  getMyTickets(): Observable<TicketAssignment[]> {
    return this.http.get<TicketAssignment[]>(this.base);
  }

  accept(ticketId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${ticketId}/accept`, {});
  }

  reject(ticketId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${ticketId}/reject`, {});
  }

  release(ticketId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${ticketId}/release`, {});
  }
  route(ticketId: number, toAgentId: number): Observable<void> {
    return this.http.post<void>(
      `${this.base}/${ticketId}/route/${toAgentId}`,
      {}
    );
  }
  getRouteCandidates(serviceKey: string): Observable<RouteCandidate[]> {
    return this.http.get<RouteCandidate[]>(
      `${this.base}/route-candidates/${serviceKey}`
    );
  }
}
