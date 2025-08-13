import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment";

export interface ServiceCountItem {
  serviceLabel: string;
  count: number;
}

@Injectable({ providedIn: "root" })
export class AdminDashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  getTicketsByService(
    range: "today" | "7d" | "30d" = "7d"
  ): Observable<ServiceCountItem[]> {
    const params = new HttpParams().set("range", range);
    return this.http.get<ServiceCountItem[]>(
      `${this.base}/stats/tickets-by-service`,
      { params }
    );
  }
}
