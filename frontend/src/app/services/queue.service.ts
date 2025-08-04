import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environment";
import { Observable } from "rxjs";

export interface TicketDto {
  number: number;
  serviceKey: string;
  serviceLabel: string;
  takenAt: string;
  assignedAgentId: number;
  assignedAt: string;
  assignmentStatus: "Pending" | "Accepted" | "Rejected";
}

@Injectable({ providedIn: "root" })
export class QueueService {
  private base = `${environment.apiUrl}/numerator`;

  // ← Burada HttpClient'i enjekte ediyoruz
  constructor(private http: HttpClient) {}

  getNext(service: string): Observable<TicketDto> {
    return this.http.get<TicketDto>(`${this.base}/next?service=${service}`);
  }
  cancel(serviceKey: string, number: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${serviceKey}/${number}`);
  }
}
