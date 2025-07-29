import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private base = `${environment.apiUrl}/numerator`;

  // ← Burada HttpClient'i enjekte ediyoruz
  constructor(private http: HttpClient) {}

  getNext(service: string): Observable<{ number: number }> {
    return this.http.get<{ number: number }>(
      `${this.base}/next?service=${service}`
    );
  }
}
