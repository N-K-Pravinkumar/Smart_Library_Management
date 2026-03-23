import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="login-brand">
          <div class="login-mark">L</div>
          <span class="login-name">Libraria</span>
        </div>
        <div class="login-hero">
          <h1 class="login-hero__title">Knowledge is the<br><em>greatest treasure.</em></h1>
          <p class="login-hero__sub">Smart library management — books, members, payments, all in one place.</p>
        </div>
        <div class="login-stats">
          <div class="login-stat"><span class="login-stat__val">10K+</span><span class="login-stat__lbl">Books</span></div>
          <div class="login-stat"><span class="login-stat__val">2K+</span><span class="login-stat__lbl">Members</span></div>
          <div class="login-stat"><span class="login-stat__val">98%</span><span class="login-stat__lbl">Satisfaction</span></div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2 class="login-card__title">Welcome back</h2>
          <p class="login-card__sub">Sign in to your library account</p>

          <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="field">
              <label class="field__label">Email address</label>
              <div class="field__wrap">
                <span class="field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input class="field__input field__input--icon" type="email" name="email"
                  [(ngModel)]="email" placeholder="admin@library.com" required />
              </div>
            </div>

            <div class="field">
              <label class="field__label">Password</label>
              <div class="field__wrap">
                <span class="field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input class="field__input field__input--icon" [type]="showPass() ? 'text' : 'password'"
                  name="password" [(ngModel)]="password" placeholder="••••••••" required />
                <button type="button" class="field__eye" (click)="togglePass()">
                  {{ showPass() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="login-demo">
              <span class="login-demo__label">Demo credentials:</span>
              <button type="button" class="login-demo__btn" (click)="fillDemo('admin')">Admin</button>
              <button type="button" class="login-demo__btn" (click)="fillDemo('librarian')">Librarian</button>
            </div>

            <button type="submit" class="btn btn--gold btn--lg login-submit" [disabled]="loading()">
              @if (loading()) {
                <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                Signing in…
              } @else {
                Sign in
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display:flex; min-height:100vh; }

    .login-left {
      flex:1; background:var(--ink); padding:48px; display:flex; flex-direction:column;
      justify-content:space-between; position:relative; overflow:hidden;
    }
    .login-left::before {
      content:''; position:absolute; width:500px; height:500px; border-radius:50%;
      background:radial-gradient(circle, rgba(200,168,75,.12) 0%, transparent 70%);
      top:-100px; right:-100px; pointer-events:none;
    }
    .login-left::after {
      content:''; position:absolute; width:300px; height:300px; border-radius:50%;
      background:radial-gradient(circle, rgba(42,157,143,.08) 0%, transparent 70%);
      bottom:80px; left:-50px; pointer-events:none;
    }

    .login-brand { display:flex; align-items:center; gap:12px; }
    .login-mark {
      width:40px; height:40px; background:var(--gold); border-radius:10px;
      font-family:var(--font-display); font-size:20px; font-weight:700; color:var(--ink);
      display:flex; align-items:center; justify-content:center;
    }
    .login-name { font-family:var(--font-display); font-size:22px; color:#fafaf8; }

    .login-hero { position:relative; z-index:1; }
    .login-hero__title {
      font-family:var(--font-display); font-size:42px; line-height:1.2;
      color:#fafaf8; margin-bottom:16px;
    }
    .login-hero__title em { color:var(--gold); font-style:italic; }
    .login-hero__sub { font-size:16px; color:var(--ink-20); line-height:1.6; max-width:380px; }

    .login-stats { display:flex; gap:32px; position:relative; z-index:1; }
    .login-stat { display:flex; flex-direction:column; gap:4px; }
    .login-stat__val { font-family:var(--font-display); font-size:28px; font-weight:700; color:var(--gold); }
    .login-stat__lbl { font-size:12px; color:var(--ink-20); text-transform:uppercase; letter-spacing:.1em; }

    .login-right {
      width:480px; flex-shrink:0; display:flex; align-items:center;
      justify-content:center; padding:48px; background:var(--paper);
    }
    .login-card { width:100%; max-width:380px; }
    .login-card__title { font-family:var(--font-display); font-size:28px; margin-bottom:6px; }
    .login-card__sub { color:var(--ink-40); font-size:15px; margin-bottom:32px; }

    .login-form { display:flex; flex-direction:column; gap:18px; }
    .field__eye {
      position:absolute; right:12px; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; font-size:14px; padding:0;
    }

    .login-demo {
      display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ink-40);
      padding:10px 14px; background:var(--paper-2); border-radius:8px;
    }
    .login-demo__label { flex-shrink:0; }
    .login-demo__btn {
      padding:3px 10px; background:white; border:1px solid var(--ink-10);
      border-radius:6px; font-size:12px; cursor:pointer; font-family:var(--font-body);
      transition:all var(--transition); color:var(--ink);
    }
    .login-demo__btn:hover { background:var(--gold); border-color:var(--gold); color:var(--ink); }

    .login-submit { width:100%; margin-top:6px; justify-content:center; }

    @media (max-width:900px) {
      .login-page { flex-direction:column; }
      .login-left { padding:32px; min-height:280px; }
      .login-hero__title { font-size:28px; }
      .login-right { width:100%; padding:32px; }
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = signal(false);
  showPass = signal(false);

  fillDemo(role: 'admin' | 'librarian') {
    this.email    = role === 'admin' ? 'admin@library.com'     : 'librarian@library.com';
    this.password = role === 'admin' ? 'Admin@123'             : 'Lib@123';
  }

  togglePass() { this.showPass.set(!this.showPass()); }

onSubmit() {
  if (!this.email || !this.password) return;
  this.loading.set(true);
  this.auth.login(this.email, this.password).subscribe({
    next: () => { this.router.navigate(['/dashboard']); },
    error: () => {
      this.toast.error('Invalid credentials.');
      this.loading.set(false);
    }
  });
}
  
}
