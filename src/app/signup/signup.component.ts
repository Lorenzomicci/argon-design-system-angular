import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
    test : Date = new Date();
    isSubmitting = false;
    errorMessage = '';

    signupForm = this.fb.group({
        displayName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        acceptsPolicy: [false, Validators.requiredTrue]
    });

    constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) { }

    ngOnInit() {}

    /**
     * Creates a new ApplicazioniuWebCloud account for the hackathon workspace.
     */
    onSubmit(): void {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.auth.register({
            displayName: this.signupForm.value.displayName as string,
            email: this.signupForm.value.email as string,
            password: this.signupForm.value.password as string,
            roles: ['participant']
        }).subscribe({
            next: () => this.router.navigate(['/home']),
            error: (error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
            },
            complete: () => (this.isSubmitting = false)
        });
    }
}
