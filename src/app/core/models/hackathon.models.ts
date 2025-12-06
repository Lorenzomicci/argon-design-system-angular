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
  description: string;
  theme: string;
  location: string;
  status: 'draft' | 'upcoming' | 'running' | 'archived';
  registrationStart: string;
  registrationEnd: string;
  eventStart: string;
  eventEnd: string;
  submissionDeadline: string;
  maxParticipants: number;
  teamSizeMin: number;
  teamSizeMax: number;
  tracks: Track[];
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

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface RegistrationRecord {
  id: string;
  hackathonId: string;
  fullName: string;
  email: string;
  university?: string;
  motivation?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface TeamMember {
  fullName: string;
  email: string;
  role?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  status: 'SENT' | 'ACCEPTED' | 'DECLINED';
}

export interface TeamRecord {
  id: string;
  hackathonId: string;
  name: string;
  description: string;
  trackId?: string;
  owner: string;
  members: TeamMember[];
  invites: TeamInvite[];
  project?: ProjectRecord;
}

export interface ProjectRecord {
  id: string;
  teamId: string;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  pitchDeckUrl?: string;
  submission?: SubmissionRecord;
  scores: ScoreRecord[];
}

export interface SubmissionRecord {
  artifactUrl: string;
  notes?: string;
  updatedAt: string;
}

export interface ScoreRecord {
  judgeName: string;
  innovation: number;
  technical_quality: number;
  impact: number;
  presentation: number;
  comment?: string;
}

export interface LeaderboardEntry {
  projectId: string;
  projectTitle: string;
  teamName: string;
  averageScore: number;
  trackName?: string;
}
