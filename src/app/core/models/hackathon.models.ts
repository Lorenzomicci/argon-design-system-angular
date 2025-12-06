export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface HackathonEvent {
  id: string;
  name: string;
  location: string;
  status: 'draft' | 'upcoming' | 'running' | 'archived';
  startDate: string;
  endDate: string;
  tracks: string[];
  maxTeamSize: number;
  registeredTeams: number;
}

export interface HackathonMetrics {
  activeParticipants: number;
  teams: number;
  submissions: number;
  mentors: number;
}

export interface TeamRegistrationPayload {
  hackathonId: string;
  teamName: string;
  members: Array<{ fullName: string; email: string; role?: string }>;
}

export interface SubmissionPayload {
  hackathonId: string;
  teamId: string;
  repositoryUrl: string;
  demoUrl?: string;
  notes?: string;
}
