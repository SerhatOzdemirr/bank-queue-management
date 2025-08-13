import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment";

//string Username , string Email , int PriorityScore
export interface UserSummaryDto {
  id: number;
  username: string;
  email: string;
  priorityScore: number;
  role : string;
}

@Injectable({ providedIn: "root" })
export class AdminUsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/users`;

  getUsers(): Observable<UserSummaryDto[]> {
    return this.http.get<UserSummaryDto[]>(this.base);
  }
  updatePriority(userId: number, score: number) {
    return this.http.put(`${this.base}/${userId}/priority`, { score });
  }
}
