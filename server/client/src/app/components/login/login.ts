import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html'
})
export class LoginComponent {

  credentials = {
    email: '',
    password: ''
  };

  isRegistering = false;

  registerData = {
    username: '',
    email: '',
    password: '',
    location: ''
  };

  isLoading = false;

  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  onLogin(): void {

    this.errorMessage = '';

    const email =
      this.credentials.email.trim();

    const password =
      this.credentials.password;

    if (!email || !password) {
      this.errorMessage =
        'Please enter your email and password.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      this.errorMessage =
        'Please enter a valid email address.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.credentials.email = email;

    this.isLoading = true;

    this.changeDetectorRef.detectChanges();

    this.authService
      .login(this.credentials)
      .subscribe({

        next: (res) => {

          console.log(
            'LOGIN SUCCESS RESPONSE:',
            res
          );

          if (!res?.token) {
            this.isLoading = false;

            this.errorMessage =
              'Login succeeded but no authentication token was received.';

            this.changeDetectorRef.detectChanges();

            return;
          }

          this.authService.saveToken(
            res.token
          );

          if (res.user) {
            this.authService.saveUser(
              res.user
            );
          }

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

          this.router.navigate([
            '/marketplace'
          ]);
        },

        error: (err) => {

          console.error(
            'LOGIN ERROR:',
            err
          );

          console.error(
            'LOGIN STATUS:',
            err?.status
          );

          console.error(
            'LOGIN ERROR BODY:',
            err?.error
          );

          this.isLoading = false;

          const serverMessage =
            typeof err?.error?.message === 'string'
              ? err.error.message.trim()
              : '';

          if (serverMessage) {
            this.errorMessage =
              serverMessage;
          } else if (err?.status === 401) {
            this.errorMessage =
              'Invalid email/username or password.';
          } else if (err?.status === 400) {
            this.errorMessage =
              'Please check your email and password.';
          } else if (err?.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please try again.';
          } else {
            this.errorMessage =
              'Login failed. Please try again.';
          }

          /*
           * Important:
           * Force Angular to refresh the UI after
           * the asynchronous HTTP error.
           */
          this.changeDetectorRef.detectChanges();

        }

      });
  }

  onRegister(): void {

    this.errorMessage = '';

    const username =
      this.registerData.username.trim();

    const email =
      this.registerData.email.trim();

    const password =
      this.registerData.password;

    if (!username || !email || !password) {
      this.errorMessage =
        'Please complete all required fields.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      this.errorMessage =
        'Please enter a valid email address.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.registerData.username =
      username;

    this.registerData.email =
      email;

    this.isLoading = true;

    this.changeDetectorRef.detectChanges();

    this.authService
      .register(this.registerData)
      .subscribe({

        next: (res) => {

          console.log(
            'REGISTRATION SUCCESS RESPONSE:',
            res
          );

          if (!res?.token) {
            this.isLoading = false;

            this.errorMessage =
              'Registration succeeded but no authentication token was received.';

            this.changeDetectorRef.detectChanges();

            return;
          }

          this.authService.saveToken(
            res.token
          );

          if (res.user) {
            this.authService.saveUser(
              res.user
            );
          }

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

          this.router.navigate([
            '/marketplace'
          ]);
        },

        error: (err) => {

          console.error(
            'REGISTRATION ERROR:',
            err
          );

          console.error(
            'REGISTRATION STATUS:',
            err?.status
          );

          console.error(
            'REGISTRATION ERROR BODY:',
            err?.error
          );

          this.isLoading = false;

          const serverMessage =
            typeof err?.error?.message === 'string'
              ? err.error.message.trim()
              : '';

          if (serverMessage) {
            this.errorMessage =
              serverMessage;
          } else if (err?.status === 409) {
            this.errorMessage =
              'Email or username already exists.';
          } else if (err?.status === 400) {
            this.errorMessage =
              'Please check your registration details.';
          } else if (err?.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please try again.';
          } else {
            this.errorMessage =
              'Registration failed. Please try again.';
          }

          this.changeDetectorRef.detectChanges();

        }

      });
  }

  switchToRegister(): void {

    this.isRegistering = true;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();
  }

  switchToLogin(): void {

    this.isRegistering = false;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();
  }
}