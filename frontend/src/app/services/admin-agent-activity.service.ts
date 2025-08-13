// src/app/services/admin-activity.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environment';

export type TicketStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface TicketBriefDto {
  ticketId: number;
  number: number;
  serviceKey: string;
  serviceLabel: string;
  assignedAt: string; 
  status: TicketStatus;
}

export interface AgentActivitySummaryDto {
  agentId: number;
  agentName: string;
  pending: number;
  accepted: number;
  rejected: number;
  total: number;
  recentTickets: TicketBriefDto[];
}

@Injectable({ providedIn: 'root' })
export class AdminActivityService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/stats`;

  get(range: 'today'|'7d'|'30d' = '7d', top = 20): Observable<AgentActivitySummaryDto[]> {
    const params = new HttpParams().set('range', range).set('top', top);
    return this.http.get<AgentActivitySummaryDto[]>(`${this.base}/agent-activity`, { params });
  }

  /** (Opsiyonel) Toplam Accepted/Rejected/Pending özetini hesaplar */
  getTotals(range: 'today'|'7d'|'30d' = '7d'): Observable<{accepted:number; rejected:number; pending:number; total:number}> {
    return this.get(range, 1).pipe(
      map(list => {
        const accepted = list.reduce((s,a)=>s+a.accepted, 0);
        const rejected = list.reduce((s,a)=>s+a.rejected, 0);
        const pending  = list.reduce((s,a)=>s+a.pending , 0);
        return { accepted, rejected, pending, total: accepted+rejected+pending };
      })
    );
  }
}
