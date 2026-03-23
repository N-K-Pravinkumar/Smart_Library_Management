import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, ActivityItem } from '../../shared/models';

const MOCK_STATS: DashboardStats = { totalBooks:3842, totalMembers:627, borrowedBooks:248, overdueBooks:12, totalRevenue:184500, newMembersThisMonth:34 };
const MOCK_ACTIVITY: ActivityItem[] = [
  { id:1, type:'borrow',     memberName:'Priya Sharma',  description:'Borrowed "Atomic Habits"',       timestamp:'2 min ago' },
  { id:2, type:'return',     memberName:'Arjun Nair',    description:'Returned "Clean Code"',           timestamp:'18 min ago' },
  { id:3, type:'payment',    memberName:'Riya Patel',    description:'Paid fine ₹120',                  timestamp:'1 hr ago' },
  { id:4, type:'new_member', memberName:'Aditya Rao',    description:'New member registration',         timestamp:'2 hr ago' },
  { id:5, type:'overdue',    memberName:'Kiran Menon',   description:'"Sapiens" — 3 days overdue',      timestamp:'3 hr ago' },
];
const MOCK_POPULAR = [
  { title:'Atomic Habits',        author:'James Clear',        borrows:48, pct:100 },
  { title:'The Alchemist',        author:'Paulo Coelho',       borrows:41, pct:85 },
  { title:'Clean Code',           author:'Robert Martin',      borrows:37, pct:77 },
  { title:'Sapiens',              author:'Yuval Noah Harari',  borrows:35, pct:73 },
  { title:'The Midnight Library', author:'Matt Haig',          borrows:29, pct:60 },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page fade-up">
      <!-- Header -->
      <div class="page-header">
        <div>
          <p class="greeting">{{ greeting }}, {{ userName() }} 👋</p>
          <h1 class="page-title">Library Overview</h1>
        </div>
        <div class="header-date">
          <p class="header-date__day">{{ today | date:'EEEE' }}</p>
          <p class="header-date__full">{{ today | date:'d MMMM y' }}</p>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stats-grid">
        <div class="stat-card stat-card--gold">
          <div class="stat-card__icon">📚</div>
          <div>
            <p class="stat-card__label">Total Books</p>
            <p class="stat-card__value">{{ stats().totalBooks | number }}</p>
            <p class="stat-card__delta stat-card__delta--up">↑ 4% this month</p>
          </div>
        </div>
        <div class="stat-card stat-card--teal">
          <div class="stat-card__icon">👥</div>
          <div>
            <p class="stat-card__label">Active Members</p>
            <p class="stat-card__value">{{ stats().totalMembers | number }}</p>
            <p class="stat-card__delta stat-card__delta--up">↑ {{ stats().newMembersThisMonth }} new</p>
          </div>
        </div>
        <div class="stat-card stat-card--default">
          <div class="stat-card__icon">📤</div>
          <div>
            <p class="stat-card__label">Books Borrowed</p>
            <p class="stat-card__value">{{ stats().borrowedBooks }}</p>
          </div>
        </div>
        <div class="stat-card stat-card--crimson">
          <div class="stat-card__icon">⏰</div>
          <div>
            <p class="stat-card__label">Overdue</p>
            <p class="stat-card__value">{{ stats().overdueBooks }}</p>
            <p class="stat-card__delta stat-card__delta--down">Needs attention</p>
          </div>
        </div>
        <div class="stat-card stat-card--gold">
          <div class="stat-card__icon">💰</div>
          <div>
            <p class="stat-card__label">Revenue (₹)</p>
            <p class="stat-card__value">₹{{ (stats().totalRevenue / 1000).toFixed(0) }}K</p>
            <p class="stat-card__delta stat-card__delta--up">↑ 12% this month</p>
          </div>
        </div>
      </div>

      <!-- Two-column grid -->
      <div class="dash-grid">
        <!-- Activity -->
        <div class="card">
          <h2 class="section-title">Recent Activity</h2>
          <div class="activity-list">
            @for (item of activity(); track item.id) {
              <div class="activity-item">
                <div class="activity-icon activity-icon--{{ typeColor(item.type) }}">
                  {{ typeIcon(item.type) }}
                </div>
                <div class="activity-body">
                  <p class="activity-member">{{ item.memberName }}</p>
                  <p class="activity-desc">{{ item.description }}</p>
                </div>
                <span class="activity-time">{{ item.timestamp }}</span>
              </div>
            }
          </div>
          <a routerLink="/borrow" class="btn btn--outline dash-btn">View all →</a>
        </div>

        <!-- Popular books -->
        <div class="card">
          <h2 class="section-title">Most Popular</h2>
          <div class="popular-list">
            @for (book of popular; track book.title; let i = $index) {
              <div class="popular-item">
                <span class="popular-rank">{{ (i+1).toString().padStart(2,'0') }}</span>
                <div class="popular-info">
                  <p class="popular-title">{{ book.title }}</p>
                  <p class="popular-author">{{ book.author }}</p>
                </div>
                <div class="popular-bar-wrap">
                  <div class="popular-bar" [style.width.%]="book.pct"></div>
                  <span class="popular-count">{{ book.borrows }}</span>
                </div>
              </div>
            }
          </div>
          <a routerLink="/books" class="btn btn--outline dash-btn">Browse catalogue →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .greeting { font-size:14px; color:var(--ink-40); margin-bottom:4px; }
    .header-date { text-align:right; }
    .header-date__day  { font-size:12px; color:var(--ink-40); text-transform:uppercase; letter-spacing:.1em; }
    .header-date__full { font-size:15px; font-weight:500; }

    .stats-grid {
      display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:28px;
    }
    @media(max-width:1100px){ .stats-grid{ grid-template-columns:repeat(3,1fr); } }
    @media(max-width:700px) { .stats-grid{ grid-template-columns:1fr 1fr; } }

    .dash-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
    @media(max-width:900px){ .dash-grid{ grid-template-columns:1fr; } }

    .section-title { font-family:var(--font-display); font-size:18px; margin-bottom:20px; }
    .dash-btn { width:100%; justify-content:center; margin-top:20px; font-size:13px; }

    /* Activity */
    .activity-list { display:flex; flex-direction:column; gap:2px; }
    .activity-item { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--ink-05); }
    .activity-item:last-child { border-bottom:none; }
    .activity-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
    .activity-icon--teal    { background:rgba(42,157,143,.1); }
    .activity-icon--gold    { background:rgba(200,168,75,.1); }
    .activity-icon--default { background:var(--ink-05); }
    .activity-icon--success { background:#d8f3dc; }
    .activity-icon--danger  { background:rgba(193,18,31,.08); }
    .activity-body { flex:1; min-width:0; }
    .activity-member { font-size:14px; font-weight:500; }
    .activity-desc   { font-size:12px; color:var(--ink-40); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .activity-time   { font-size:11px; color:var(--ink-20); white-space:nowrap; }

    /* Popular */
    .popular-list { display:flex; flex-direction:column; gap:14px; }
    .popular-item { display:flex; align-items:center; gap:12px; }
    .popular-rank  { font-family:var(--font-mono); font-size:12px; color:var(--ink-20); width:22px; flex-shrink:0; }
    .popular-info  { flex:1; min-width:0; }
    .popular-title { font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .popular-author{ font-size:12px; color:var(--ink-40); }
    .popular-bar-wrap{ display:flex; align-items:center; gap:8px; width:110px; }
    .popular-bar   { height:4px; background:var(--gold); border-radius:2px; min-width:4px; transition:width .5s ease; }
    .popular-count { font-size:12px; color:var(--ink-40); font-family:var(--font-mono); white-space:nowrap; }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  stats    = signal(MOCK_STATS);
  activity = signal(MOCK_ACTIVITY);
  popular  = MOCK_POPULAR;
  today    = new Date();
  greeting = (() => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; })();

  userName(): string {
    const name = this.auth.user()?.name;
    return name ? name.split(' ')[0] : 'there';
  }

  typeIcon(t: string) {
    return ({ borrow:'📖', return:'↩️', payment:'💳', new_member:'👤', overdue:'⚠️' } as any)[t] ?? '•';
  }
  typeColor(t: string) {
    return ({ borrow:'teal', return:'default', payment:'gold', new_member:'success', overdue:'danger' } as any)[t] ?? 'default';
  }

  ngOnInit() {
    // Uncomment to use real API:
    // this.api.getDashboardStats().subscribe(s => this.stats.set(s));
    // this.api.getRecentActivity().subscribe(a => this.activity.set(a));
  }
}
