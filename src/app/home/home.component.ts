import { Component, OnInit } from '@angular/core';
import { HackathonService } from '../core/services/hackathon.service';
import { HackathonEvent, HackathonMetrics } from '../core/models/hackathon.models';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
    metrics?: HackathonMetrics;
    events: HackathonEvent[] = [];
    isLoading = false;
    errorMessage = '';

    constructor(private readonly hackathonService: HackathonService) { }

    ngOnInit() {
        this.loadDashboard();
    }

    /**
     * Pulls dashboard metrics and featured hackathons from the backend.
     */
    loadDashboard(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.hackathonService.getDashboardMetrics().subscribe({
            next: (metrics) => (this.metrics = metrics),
            error: (error) => (this.errorMessage = error.message),
        });

        this.hackathonService.listHackathons().subscribe({
            next: (events) => (this.events = events),
            error: (error) => (this.errorMessage = error.message),
            complete: () => (this.isLoading = false),
        });
    }
}
