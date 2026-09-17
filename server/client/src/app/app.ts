import { Component } from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import {
  AuthService,
  AuthUser
} from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './app.html'
})
export class App {

  currentUser: AuthUser | null = null;

  showUserMenu = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.authService.user$.subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error(
          'Authentication state error:',
          error
        );
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get displayName(): string {
    if (!this.currentUser) {
      return 'Account';
    }

    return (
      this.currentUser.username ||
      this.currentUser.name ||
      this.currentUser.email ||
      'Account'
    );
  }

  get displayEmail(): string {
    return this.currentUser?.email || '';
  }

  toggleUserMenu(): void {
    this.showUserMenu =
      !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();

    this.showUserMenu = false;

    this.router.navigate([
      '/marketplace'
    ]);
  }
}