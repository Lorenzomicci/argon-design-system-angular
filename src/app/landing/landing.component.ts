import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  HackathonEvent,
  LeaderboardEntry,
  RegistrationRecord,
  TeamRecord,
  Track
} from '../core/models/hackathon.models';
import { MockHackathonService } from '../core/services/mock-hackathon.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  hackathons: HackathonEvent[] = [];
  registrations: RegistrationRecord[] = [];
  teams: TeamRecord[] = [];
  leaderboard: LeaderboardEntry[] = [];

  readonly hackathonForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    theme: ['', Validators.required],
    location: ['', Validators.required],
    status: ['upcoming', Validators.required],
    registrationStart: ['', Validators.required],
    registrationEnd: ['', Validators.required],
    eventStart: ['', Validators.required],
    eventEnd: ['', Validators.required],
    submissionDeadline: ['', Validators.required],
    maxParticipants: [200, [Validators.required, Validators.min(1)]],
    teamSizeMin: [2, [Validators.required, Validators.min(1)]],
    teamSizeMax: [5, [Validators.required, Validators.min(1)]],
  });

  readonly trackForm = this.fb.group({
    hackathonId: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  readonly registrationForm = this.fb.group({
    hackathonId: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    university: [''],
    motivation: ['']
  });

  readonly teamForm = this.fb.group({
    hackathonId: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    trackId: [''],
    owner: ['', Validators.required],
    membersRaw: ['', Validators.required]
  });

  readonly projectForm = this.fb.group({
    teamId: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    repoUrl: ['', Validators.required],
    demoUrl: [''],
    pitchDeckUrl: ['']
  });

  readonly submissionForm = this.fb.group({
    teamId: ['', Validators.required],
    artifactUrl: ['', Validators.required],
    notes: ['']
  });

  readonly scoreForm = this.fb.group({
    teamId: ['', Validators.required],
    judgeName: ['', Validators.required],
    innovation: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    technical_quality: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    impact: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    presentation: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  selectedLeaderboardHackathon = '';

  constructor(private readonly fb: FormBuilder, private readonly mock: MockHackathonService) { }

  ngOnInit() {
    this.mock.hackathonStream.subscribe((hackathons) => {
      this.hackathons = hackathons;
      if (!this.trackForm.value.hackathonId && hackathons.length) {
        this.trackForm.patchValue({ hackathonId: hackathons[0].id });
      }
      if (!this.registrationForm.value.hackathonId && hackathons.length) {
        this.registrationForm.patchValue({ hackathonId: hackathons[0].id });
      }
      if (!this.teamForm.value.hackathonId && hackathons.length) {
        this.teamForm.patchValue({ hackathonId: hackathons[0].id });
      }
      if (!this.selectedLeaderboardHackathon && hackathons.length) {
        this.selectedLeaderboardHackathon = hackathons[0].id;
        this.refreshLeaderboard();
      }
    });

    this.mock.registrationStream.subscribe((registrations) => (this.registrations = registrations));
    this.mock.teamStream.subscribe((teams) => (this.teams = teams));
  }

  get tracksForTeamForm(): Track[] {
    const hackathonId = this.teamForm.value.hackathonId;
    const hackathon = this.hackathons.find((h) => h.id === hackathonId);
    return hackathon?.tracks ?? [];
  }

  createHackathon(): void {
    if (this.hackathonForm.invalid) {
      this.hackathonForm.markAllAsTouched();
      return;
    }
    const payload = this.hackathonForm.value as unknown as HackathonEvent;
    this.mock.createHackathon(payload);
    this.hackathonForm.reset({ status: 'upcoming', maxParticipants: 200, teamSizeMin: 2, teamSizeMax: 5 });
  }

  addTrack(): void {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }
    const { hackathonId, name, description } = this.trackForm.value;
    this.mock.addTrack(hackathonId!, { name: name!, description: description! });
    this.trackForm.patchValue({ name: '', description: '' });
  }

  registerUser(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    this.mock.registerParticipant(this.registrationForm.value as unknown as RegistrationRecord);
    this.registrationForm.patchValue({ fullName: '', email: '', university: '', motivation: '' });
  }

  createTeam(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }
    const { hackathonId, name, description, trackId, owner, membersRaw } = this.teamForm.value;
    const members = (membersRaw || '')
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => {
        const [fullName, email, role] = row.split(',').map((part) => part.trim());
        return { fullName, email, role };
      });
    this.mock.createTeam({
      hackathonId: hackathonId!,
      name: name!,
      description: description!,
      trackId: trackId || undefined,
      owner: owner!,
      members,
      invites: []
    });
    this.teamForm.patchValue({ name: '', description: '', owner: '', membersRaw: '' });
  }

  createProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const { teamId, ...rest } = this.projectForm.value;
    this.mock.createProject(teamId!, rest as any);
    this.projectForm.patchValue({ title: '', description: '', repoUrl: '', demoUrl: '', pitchDeckUrl: '' });
    this.refreshLeaderboard();
  }

  submitArtifact(): void {
    if (this.submissionForm.invalid) {
      this.submissionForm.markAllAsTouched();
      return;
    }
    const { teamId, artifactUrl, notes } = this.submissionForm.value;
    this.mock.submitDeliverable(teamId!, { artifactUrl: artifactUrl!, notes: notes || '' });
  }

  addScore(): void {
    if (this.scoreForm.invalid) {
      this.scoreForm.markAllAsTouched();
      return;
    }
    const { teamId, ...score } = this.scoreForm.value;
    this.mock.addScore(teamId!, score as any);
    this.refreshLeaderboard();
  }

  refreshLeaderboard(): void {
    if (this.selectedLeaderboardHackathon) {
      this.leaderboard = this.mock.leaderboard(this.selectedLeaderboardHackathon);
    }
  }
}
