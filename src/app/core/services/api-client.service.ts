import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Lightweight HTTP client that centralizes base URL configuration and
 * error handling for calls to the ApplicazioniuWebCloud backend.
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Builds a fully-qualified endpoint path using the configured backend base URL.
   */
  private buildUrl(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }

  /**
   * Executes a GET request against the backend.
   * @param path Relative path to the resource (e.g. /hackathons)
   * @param params Optional query parameters object
   */
  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(path), { params })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Executes a POST request against the backend.
   * @param path Relative path to the resource
   * @param body Payload to submit
   */
  post<T>(path: string, body: unknown, headers?: HttpHeaders): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(path), body, { headers })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Executes a PATCH request for partial updates.
   * @param path Relative path to the resource
   * @param body Payload to submit
   */
  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(path), body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Centralized error handler to avoid leaking backend implementation details
   * into the UI. Converts HttpErrorResponse into a user-friendly error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message || error.statusText || 'Unable to communicate with the hackathon platform API.';
    return throwError(() => new Error(message));
  }
}
