import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  HackathonEvent,
  LeaderboardEntry,
  ProjectRecord,
  RegistrationRecord,
  ScoreRecord,
  SubmissionRecord,
  TeamInvite,
  TeamMember,
  TeamRecord,
  Track,
} from '../models/hackathon.models';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

@Injectable({ providedIn: 'root' })
export class MockHackathonService {
  private readonly hackathons$ = new BehaviorSubject<HackathonEvent[]>([{
    id: uid('hack'),
    name: 'Campus AI Jam',
    description: 'Hackathon universitario focalizzato su applicazioni AI responsabili.',
    theme: 'AI for Good',
    location: 'Torino',
    status: 'upcoming',
    registrationStart: '2024-09-01T09:00:00Z',
    registrationEnd: '2024-10-01T18:00:00Z',
    eventStart: '2024-10-05T09:00:00Z',
    eventEnd: '2024-10-06T18:00:00Z',
    submissionDeadline: '2024-10-06T16:00:00Z',
    maxParticipants: 200,
    teamSizeMin: 2,
    teamSizeMax: 5,
    tracks: [
      { id: uid('track'), name: 'AI', description: 'Modelli ML, NLP e Computer Vision' },
      { id: uid('track'), name: 'Web', description: 'Prodotti web e mobile' }
    ],
    registeredTeams: 4
  }, {
    id: uid('hack'),
    name: 'Green Tech Sprint',
    description: 'Soluzioni sostenibili per l\'energia e la mobilità.',
    theme: 'Sustainability',
    location: 'Milano',
    status: 'running',
    registrationStart: '2024-06-01T09:00:00Z',
    registrationEnd: '2024-07-15T18:00:00Z',
    eventStart: '2024-07-20T09:00:00Z',
    eventEnd: '2024-07-21T18:00:00Z',
    submissionDeadline: '2024-07-21T15:00:00Z',
    maxParticipants: 150,
    teamSizeMin: 3,
    teamSizeMax: 6,
    tracks: [
      { id: uid('track'), name: 'Energy', description: 'Ottimizzazione reti e storage' },
      { id: uid('track'), name: 'Mobility', description: 'Trasporto intelligente e sicuro' }
    ],
    registeredTeams: 6
  }]);

  private readonly registrations$ = new BehaviorSubject<RegistrationRecord[]>([]);
  private readonly teams$ = new BehaviorSubject<TeamRecord[]>([]);

  get hackathonStream() {
    return this.hackathons$.asObservable();
  }

  get registrationStream() {
    return this.registrations$.asObservable();
  }

  get teamStream() {
    return this.teams$.asObservable();
  }

  createHackathon(payload: Omit<HackathonEvent, 'id' | 'tracks' | 'registeredTeams'> & { tracks?: Track[] }): void {
    const hackathons = this.hackathons$.getValue();
    this.hackathons$.next([
      ...hackathons,
      {
        ...payload,
        id: uid('hack'),
        tracks: payload.tracks ?? [],
        registeredTeams: 0
      }
    ]);
  }

  addTrack(hackathonId: string, track: Pick<Track, 'name' | 'description'>): void {
    this.updateHackathon(hackathonId, (h) => ({
      ...h,
      tracks: [...h.tracks, { ...track, id: uid('track') }]
    }));
  }

  registerParticipant(payload: Omit<RegistrationRecord, 'id' | 'status'>): void {
    const next: RegistrationRecord = {
      ...payload,
      id: uid('reg'),
      status: 'PENDING'
    };
    this.registrations$.next([...this.registrations$.getValue(), next]);
  }

  updateRegistrationStatus(registrationId: string, status: RegistrationRecord['status']): void {
    this.registrations$.next(
      this.registrations$.getValue().map((reg) => reg.id === registrationId ? { ...reg, status } : reg)
    );
  }

  createTeam(payload: Omit<TeamRecord, 'id' | 'invites' | 'project'> & { members: TeamMember[]; invites?: TeamInvite[] }): void {
    const next: TeamRecord = {
      ...payload,
      id: uid('team'),
      invites: payload.invites ?? [],
      project: undefined
    };
    this.teams$.next([...this.teams$.getValue(), next]);
    this.incrementTeamCounter(payload.hackathonId);
  }

  inviteMember(teamId: string, email: string): void {
    this.teams$.next(
      this.teams$.getValue().map((team) => team.id === teamId
        ? { ...team, invites: [...team.invites, { id: uid('invite'), email, status: 'SENT' }] }
        : team)
    );
  }

  respondToInvite(teamId: string, inviteId: string, accept: boolean): void {
    this.teams$.next(
      this.teams$.getValue().map((team) => {
        if (team.id !== teamId) { return team; }
        const invites = team.invites.map((invite) => invite.id === inviteId
          ? { ...invite, status: accept ? 'ACCEPTED' : 'DECLINED' }
          : invite);
        const acceptedInvite = invites.find((inv) => inv.id === inviteId && inv.status === 'ACCEPTED');
        const members = acceptedInvite
          ? [...team.members, { fullName: acceptedInvite.email.split('@')[0], email: acceptedInvite.email }]
          : team.members;
        return { ...team, invites, members };
      })
    );
  }

  createProject(teamId: string, project: Omit<ProjectRecord, 'id' | 'teamId' | 'scores' | 'submission'>): void {
    this.teams$.next(
      this.teams$.getValue().map((team) => team.id === teamId
        ? { ...team, project: { ...project, id: uid('proj'), teamId, scores: [] } }
        : team)
    );
  }

  submitDeliverable(teamId: string, submission: Pick<SubmissionRecord, 'artifactUrl' | 'notes'>): void {
    this.teams$.next(
      this.teams$.getValue().map((team) => team.id === teamId && team.project
        ? { ...team, project: { ...team.project, submission: { ...submission, updatedAt: new Date().toISOString() } } }
        : team)
    );
  }

  addScore(teamId: string, score: ScoreRecord): void {
    this.teams$.next(
      this.teams$.getValue().map((team) => team.id === teamId && team.project
        ? { ...team, project: { ...team.project, scores: [...team.project.scores, score] } }
        : team)
    );
  }

  leaderboard(hackathonId: string): LeaderboardEntry[] {
    const teams = this.teams$.getValue().filter((team) => team.hackathonId === hackathonId && team.project);
    return teams.map((team) => {
      const project = team.project as ProjectRecord;
      const averageScore = project.scores.length
        ? project.scores.reduce((acc, score) => acc + this.scoreAverage(score), 0) / project.scores.length
        : 0;
      const hackathon = this.hackathons$.getValue().find((h) => h.id === hackathonId);
      const trackName = hackathon?.tracks.find((t) => t.id === team.trackId)?.name;
      return {
        projectId: project.id,
        projectTitle: project.title,
        teamName: team.name,
        averageScore: Number(averageScore.toFixed(2)),
        trackName
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }

  findTeam(teamId: string): TeamRecord | undefined {
    return this.teams$.getValue().find((team) => team.id === teamId);
  }

  private scoreAverage(score: ScoreRecord): number {
    const sum = score.impact + score.innovation + score.presentation + score.technical_quality;
    return sum / 4;
  }

  private updateHackathon(id: string, mutate: (hackathon: HackathonEvent) => HackathonEvent): void {
    this.hackathons$.next(
      this.hackathons$.getValue().map((hackathon) => hackathon.id === id ? mutate(hackathon) : hackathon)
    );
  }

  private incrementTeamCounter(hackathonId: string): void {
    this.updateHackathon(hackathonId, (hackathon) => ({
      ...hackathon,
      registeredTeams: hackathon.registeredTeams + 1
    }));
  }
}
