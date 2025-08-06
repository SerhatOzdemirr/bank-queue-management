import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

export interface CreateAgentWithSkillsDto {
  username: string;
  email: string;
  password: string;
  serviceKeys: string[];
}

export interface AgentWithSkillsDto {
  agentId: number;
  username: string;
  email: string;
  serviceKeys: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminAgentsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/agents`;

  getAgents(): Observable<AgentWithSkillsDto[]> {
    return this.http.get<AgentWithSkillsDto[]>(this.base);
  }

  createAgent(dto: CreateAgentWithSkillsDto): Observable<AgentWithSkillsDto> {
    return this.http.post<AgentWithSkillsDto>(this.base, dto);
  }
}
