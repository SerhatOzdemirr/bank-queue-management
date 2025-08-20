import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environment";
import { Observable, BehaviorSubject, tap } from "rxjs";

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

  // Profile bilgisini reactive state olarak tut
  private profileSubject = new BehaviorSubject<ProfileDto | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Backend'den profili alır ve subject'e koyar */
  loadProfile(): Observable<ProfileDto> {
    return this.http
      .get<ProfileDto>(this.base)
      .pipe(tap((p) => this.profileSubject.next(p)));
  }

  /** Mevcut değeri senkron çekmek gerekirse */
  get currentProfile(): ProfileDto | null {
    return this.profileSubject.value;
  }

  updateProfile(data: UpdateProfileDto) {
    return this.http
      .put<ProfileDto>(`${this.base}`, data)
      .pipe(tap((p) => this.profileSubject.next(p)));
  }

  getProfileStatistics(): Observable<ProfileStatisticsDto> {
    return this.http.get<ProfileStatisticsDto>(`${this.base}/statistics`);
  }

  getTicketHistory(): Observable<TicketHistoryDto[]> {
    return this.http.get<TicketHistoryDto[]>(`${this.base}/ticket-history`);
  }

  uploadAvatar(file: File): Observable<{ url: string; relativeUrl: string }> {
    const form = new FormData();
    form.append("avatar", file);
    return this.http
      .post<{ url: string; relativeUrl: string }>(`${this.base}/avatar`, form)
      .pipe(
        tap((res) => {
          // mevcut profile'ı güncelle
          const cur = this.profileSubject.value;
          if (cur) {
            this.profileSubject.next({
              ...cur,
              avatarUrl: res.relativeUrl,
            });
          }
        })
      );
  }
}
