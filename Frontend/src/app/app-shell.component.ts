import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard',      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { path: '/books',     label: 'Books',           icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z' },
  { path: '/members',   label: 'Members',         icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { path: '/borrow',    label: 'Borrow / Return', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { path: '/payments',  label: 'Payments',        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z' },
  { path: '/reports',   label: 'Reports',         icon: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z', adminOnly: true },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">

        <div class="sidebar__header">
          <div class="sidebar__logo">
            <div class="sidebar__mark">L</div>
            @if (!collapsed()) {
              <div class="sidebar__brand-wrap">
                <span class="sidebar__brand">Libraria</span>
                <span class="sidebar__tagline">Smart Library</span>
              </div>
            }
          </div>
          <button class="sidebar__toggle" (click)="toggleCollapsed()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path [attr.d]="toggleIcon()"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar__nav">
          @for (item of visibleNav(); track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="sidebar__link--active"
               class="sidebar__link"
               [title]="navTitle(item)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.8" class="sidebar__link-icon">
                <path [attr.d]="item.icon"/>
              </svg>
              @if (!collapsed()) {
                <span class="sidebar__link-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar__footer">
          @if (!collapsed() && auth.user()) {
            <div class="sidebar__user">
              <div class="sidebar__avatar">{{ userInitial() }}</div>
              <div>
                <p class="sidebar__user-name">{{ auth.user()!.name }}</p>
                <p class="sidebar__user-role">{{ auth.user()!.role }}</p>
              </div>
            </div>
          }
          <button class="sidebar__logout" (click)="auth.logout()" [title]="logoutTitle()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            @if (!collapsed()) {
              <span>Logout</span>
            }
          </button>
        </div>

      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display:flex; min-height:100vh; }
    .sidebar {
      width:240px; min-height:100vh; background:var(--ink);
      display:flex; flex-direction:column; position:sticky; top:0; height:100vh;
      transition:width var(--transition); flex-shrink:0; overflow:hidden;
      border-right:1px solid rgba(255,255,255,0.06);
    }
    .sidebar--collapsed { width:64px; }
    .sidebar__header {
      padding:18px 14px; display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid rgba(255,255,255,0.06); min-height:68px;
    }
    .sidebar__logo { display:flex; align-items:center; gap:10px; overflow:hidden; min-width:0; }
    .sidebar__mark {
      width:36px; height:36px; background:var(--gold); border-radius:8px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-family:var(--font-display); font-size:18px; font-weight:700; color:var(--ink);
    }
    .sidebar__brand-wrap { overflow:hidden; white-space:nowrap; min-width:0; }
    .sidebar__brand   { display:block; font-family:var(--font-display); font-size:16px; font-weight:600; color:#fafaf8; }
    .sidebar__tagline { display:block; font-size:10px; color:var(--ink-20); text-transform:uppercase; letter-spacing:.1em; }
    .sidebar__toggle {
      background:none; border:none; cursor:pointer; color:var(--ink-20);
      padding:6px; border-radius:6px; transition:all var(--transition); flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
    }
    .sidebar__toggle:hover { color:#fafaf8; background:rgba(255,255,255,0.08); }
    .sidebar__nav { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
    .sidebar__link {
      display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px;
      color:var(--ink-20); text-decoration:none; font-size:14px; font-weight:500;
      transition:all var(--transition); white-space:nowrap; overflow:hidden;
    }
    .sidebar__link:hover { background:rgba(255,255,255,0.07); color:#fafaf8; }
    .sidebar__link--active { background:rgba(255,255,255,0.1) !important; color:var(--gold) !important; }
    .sidebar__link-icon { flex-shrink:0; }
    .sidebar__link-label { overflow:hidden; text-overflow:ellipsis; }
    .sidebar__footer {
      padding:10px 8px; border-top:1px solid rgba(255,255,255,0.06);
      display:flex; flex-direction:column; gap:6px;
    }
    .sidebar__user {
      display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; overflow:hidden;
    }
    .sidebar__avatar {
      width:32px; height:32px; border-radius:50%; background:var(--gold); color:var(--ink);
      font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .sidebar__user-name { font-size:13px; font-weight:500; color:#fafaf8; white-space:nowrap; }
    .sidebar__user-role { font-size:10px; color:var(--ink-20); text-transform:uppercase; letter-spacing:.06em; }
    .sidebar__logout {
      display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px;
      background:none; border:none; cursor:pointer; color:var(--ink-20);
      font-size:14px; transition:all var(--transition); text-align:left;
      overflow:hidden; white-space:nowrap; width:100%;
    }
    .sidebar__logout:hover { background:rgba(193,18,31,.18); color:#ff6b6b; }
    .main-content { flex:1; min-width:0; overflow-x:hidden; }
  `]
})
export class AppShellComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  toggleCollapsed(): void { this.collapsed.set(!this.collapsed()); }
  toggleIcon(): string { return this.collapsed() ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'; }
  logoutTitle(): string { return this.collapsed() ? 'Logout' : ''; }
  navTitle(item: NavItem): string { return this.collapsed() ? item.label : ''; }
  userInitial(): string { return this.auth.user()?.name?.[0]?.toUpperCase() ?? 'U'; }
  visibleNav(): NavItem[] { return NAV.filter(n => !n.adminOnly || this.auth.isAdmin()); }
}
