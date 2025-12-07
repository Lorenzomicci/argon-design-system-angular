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
        map((events) => events.sort((a, b) => a.eventStart.localeCompare(b.eventStart))),
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
        description: 'Weekend dedicato a soluzioni responsabili basate su AI.',
        theme: 'AI',
        location: 'Remote-first',
        status: 'upcoming',
        registrationStart: new Date().toISOString(),
        registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventStart: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        eventEnd: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        tracks: [
          { id: 'track-1', name: 'Sustainability', description: 'Energia, clima e circolarità' },
          { id: 'track-2', name: 'Health', description: 'Salute digitale e prevenzione' },
          { id: 'track-3', name: 'Education', description: 'Apprendimento personalizzato' }
        ],
        maxParticipants: 250,
        teamSizeMin: 2,
        teamSizeMax: 5,
        registeredTeams: 12
      },
      {
        id: 'demo-2',
        name: 'Open Data Challenge',
        description: 'Esperienza ibrida su dataset pubblici e civic tech.',
        theme: 'Open Data',
        location: 'Hybrid - Corinaldo',
        status: 'running',
        registrationStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEnd: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        eventStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        eventEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        tracks: [
          { id: 'track-4', name: 'Smart Cities', description: 'Mobilità e servizi pubblici data-driven' },
          { id: 'track-5', name: 'Transparency', description: 'Accountability e open government' }
        ],
        maxParticipants: 180,
        teamSizeMin: 3,
        teamSizeMax: 4,
        registeredTeams: 8
      }
    ];
  }
}
