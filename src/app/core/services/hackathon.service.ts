import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  HackathonEvent,
  HackathonMetrics,
  SubmissionPayload,
  TeamRegistrationPayload
} from '../models/hackathon.models';
import { ApiClientService } from './api-client.service';
import { AuthService } from '../auth/auth.service';

/**
 * HackathonService orchestrates all CRUD-style operations for events,
 * teams and submissions through the ApplicazioniuWebCloud API.
 */
@Injectable({ providedIn: 'root' })
export class HackathonService {
  private readonly hackathonPath = environment.endpoints.hackathons;
  private readonly submissionPath = environment.endpoints.submissions;
  private readonly teamPath = environment.endpoints.teams;

  constructor(private readonly api: ApiClientService, private readonly auth: AuthService) {}

  /**
   * Returns a concise dashboard summary for the landing page. If the backend
   * cannot be reached, a local fallback keeps the UI populated.
   */
  getDashboardMetrics(): Observable<HackathonMetrics> {
    return this.api
      .get<HackathonMetrics>(`${this.hackathonPath}/metrics`)
      .pipe(catchError(() => of({ activeParticipants: 0, teams: 0, submissions: 0, mentors: 0 })));
  }

  /**
   * Lists events so participants and organizers can navigate through upcoming
   * and running hackathons.
   */
  listHackathons(): Observable<HackathonEvent[]> {
    return this.api
      .get<HackathonEvent[]>(this.hackathonPath)
      .pipe(
        map((events) => events.sort((a, b) => a.startDate.localeCompare(b.startDate))),
        catchError(() => of(this.buildFallbackEvents()))
      );
  }

  /**
   * Submits a new team registration for the selected hackathon.
   */
  registerTeam(payload: TeamRegistrationPayload): Observable<void> {
    const headers = this.auth.buildAuthHeaders();
    return this.api.post<void>(`${this.teamPath}`, payload, headers);
  }

  /**
   * Uploads a project submission on behalf of a team.
   */
  submitProject(payload: SubmissionPayload): Observable<void> {
    const headers = this.auth.buildAuthHeaders();
    return this.api.post<void>(`${this.submissionPath}`, payload, headers);
  }

  private buildFallbackEvents(): HackathonEvent[] {
    return [
      {
        id: 'demo-1',
        name: 'AI for Good',
        location: 'Remote-first',
        status: 'upcoming',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        tracks: ['Sustainability', 'Health', 'Education'],
        maxTeamSize: 5,
        registeredTeams: 12
      },
      {
        id: 'demo-2',
        name: 'Open Data Challenge',
        location: 'Hybrid - Corinaldo',
        status: 'running',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        tracks: ['Smart Cities', 'Transparency'],
        maxTeamSize: 4,
        registeredTeams: 8
      }
    ];
  }
}
