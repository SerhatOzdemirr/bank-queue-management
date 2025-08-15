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
}
