import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environment";
import { Observable } from "rxjs";

export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  priorityScore: number;
  role: string;
  avatarUrl: string | null;
}

export interface UpdateProfileDto {
  username: string;
  email: string;
  password?: string | null;
}

export interface ProfileStatisticsDto {
  totalTickets: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface TicketHistoryDto {
  service: string;
  number: number;
  status: string;
  takenAt: string;
}

@Injectable({ providedIn: "root" })
export class ProfileService {
  private base = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfileInfo(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(this.base);
  }

  updateProfile(data: UpdateProfileDto) {
    return this.http.put(`${this.base}`, data);
  }

  getProfileStatistics(): Observable<ProfileStatisticsDto> {
    return this.http.get<ProfileStatisticsDto>(`${this.base}/statistics`);
  }

  getTicketHistory(): Observable<TicketHistoryDto[]> {
    return this.http.get<TicketHistoryDto[]>(`${this.base}/ticket-history`);
  }
}
