import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Attaches the Authorization header and reports unauthorized responses.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers = this.auth.buildAuthHeaders();
    const headerMap = headers.keys().reduce((acc, key) => {
      const value = headers.get(key);
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const authReq = Object.keys(headerMap).length ? req.clone({ setHeaders: headerMap }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
