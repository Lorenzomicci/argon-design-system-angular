import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiClientService } from '../services/api-client.service';
import { AuthResponse, AuthTokens, UserProfile } from '../models/hackathon.models';
import { environment } from '../../../environments/environment';

/**
 * Authentication service responsible for delegating login/register requests
 * to the ApplicazioniuWebCloud backend and storing session tokens.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authPath = environment.endpoints.auth;
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly api: ApiClientService) {
    const storedUser = localStorage.getItem('hackathonUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  /**
   * Authenticates the user and persists the returned token set.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(`${this.authPath}/login`, { email, password }).pipe(
      tap((response) => {
        this.persistSession(response);
      })
    );
  }

  /**
   * Registers a new participant or organizer.
   */
  register(payload: Partial<UserProfile> & { password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(`${this.authPath}/register`, payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  /**
   * Clears the locally stored session and resets the user stream.
   */
  logout(): void {
    localStorage.removeItem('hackathonUser');
    localStorage.removeItem('hackathonTokens');
    this.currentUserSubject.next(null);
  }

  /**
   * Builds the Authorization header for secured endpoints.
   */
  buildAuthHeaders(): HttpHeaders {
    const tokens = this.getTokens();
    return tokens?.accessToken
      ? new HttpHeaders({ Authorization: `Bearer ${tokens.accessToken}` })
      : new HttpHeaders();
  }

  /**
   * Retrieves the currently cached token set without touching the observable stream.
   */
  getTokens(): AuthTokens | null {
    const raw = localStorage.getItem('hackathonTokens');
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem('hackathonUser', JSON.stringify(response.user));
    localStorage.setItem('hackathonTokens', JSON.stringify(response.tokens));
    this.currentUserSubject.next(response.user);
  }
}
