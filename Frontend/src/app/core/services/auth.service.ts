import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isLibrarian = computed(() => ['ADMIN', 'LIBRARIAN'].includes(this._user()?.role ?? ''));

  constructor(private api: ApiService, private router: Router) {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    const token = localStorage.getItem('libraria_token');
    if (token) {
      this.api.getProfile().subscribe({
        next: user => this._user.set(user),
        error: () => this.clearSession()
      });
    }
  }

login(email: string, password: string) {
  return this.api.login(email, password).pipe(
    tap((res: any) => {
      localStorage.setItem('libraria_token', res.token);
      this._user.set({
        id:    res.id,
        name:  res.username,
        email: res.email,
        role:  res.role
      });
    })
  );
}

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    localStorage.removeItem('libraria_token');
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('libraria_token');
  }
}
