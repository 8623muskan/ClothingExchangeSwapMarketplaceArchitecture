import { Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

export interface AuthUser {
  _id?: string;
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://127.0.0.1:5000/api/auth';

  private readonly userSubject =
    new BehaviorSubject<AuthUser | null>(
      this.getStoredUser()
    );

  readonly user$ =
    this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient
  ) {}

  register(userData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      userData
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      credentials
    );
  }

  saveToken(token: string): void {
    if (!token) {
      console.error(
        'Cannot save empty authentication token.'
      );
      return;
    }

    localStorage.setItem(
      'token',
      token
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveUser(user: AuthUser): void {
    if (!user) {
      console.error(
        'Cannot save empty user.'
      );
      return;
    }

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );

    this.userSubject.next(user);
  }

  getUser(): AuthUser | null {
    return this.getStoredUser();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.userSubject.next(null);
  }

  private getStoredUser(): AuthUser | null {
    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        'Invalid stored user data:',
        error
      );

      localStorage.removeItem('user');

      return null;
    }
  }
}