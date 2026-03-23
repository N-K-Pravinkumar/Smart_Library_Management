import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Member } from '../../shared/models';

const MOCK_MEMBERS: Member[] = [
  { id:1, name:'Priya Sharma',   email:'priya@email.com',  phone:'9876543210', memberId:'LIB001', membershipType:'PREMIUM', membershipExpiry:'2025-12-31', borrowedCount:3, fineAmount:0,   joinDate:'2023-01-10', status:'ACTIVE' },
  { id:2, name:'Arjun Nair',     email:'arjun@email.com',  phone:'9876543211', memberId:'LIB002', membershipType:'BASIC',   membershipExpiry:'2024-06-30', borrowedCount:1, fineAmount:120, joinDate:'2023-03-22', status:'ACTIVE' },
  { id:3, name:'Riya Patel',     email:'riya@email.com',   phone:'9876543212', memberId:'LIB003', membershipType:'STUDENT', membershipExpiry:'2024-09-15', borrowedCount:2, fineAmount:0,   joinDate:'2023-06-01', status:'ACTIVE' },
  { id:4, name:'Kiran Menon',    email:'kiran@email.com',  phone:'9876543213', memberId:'LIB004', membershipType:'BASIC',   membershipExpiry:'2024-02-28', borrowedCount:0, fineAmount:240, joinDate:'2022-11-14', status:'SUSPENDED' },
  { id:5, name:'Aditya Rao',     email:'aditya@email.com', phone:'9876543214', memberId:'LIB005', membershipType:'PREMIUM', membershipExpiry:'2025-05-20', borrowedCount:4, fineAmount:0,   joinDate:'2024-01-05', status:'ACTIVE' },
  { id:6, name:'Deepa Krishnan', email:'deepa@email.com',  phone:'9876543215', memberId:'LIB006', membershipType:'STUDENT', membershipExpiry:'2024-04-30', borrowedCount:0, fineAmount:0,   joinDate:'2023-08-18', status:'EXPIRED' },
];

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Members</h1>
          <p class="page-subtitle">{{ members().length }} registered members</p>
        </div>
        <button class="btn btn--gold" (click)="openModal()">+ Add Member</button>
      </div>

      <div class="toolbar">
        <div class="field toolbar__search" style="margin-bottom:0">
          <div class="field__wrap">
            <span class="field__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input class="field__input field__input--icon" placeholder="Search name, email, ID…"
              [(ngModel)]="search" (ngModelChange)="applyFilter()" />
          </div>
        </div>
        <div class="status-filters">
          @for (s of statuses; track s) {
            <button class="cat-pill" [class.cat-pill--active]="activeStatus() === s" (click)="setStatus(s)">{{ s }}</button>
          }
        </div>
      </div>

      <div class="members-grid">
        @for (m of filtered(); track m.id) {
          <div class="member-card">
            <div class="member-card__top">
              <div class="member-avatar" [style.background]="getAvatarColor(m.name)">
                {{ m.name[0].toUpperCase() }}
              </div>
              <div class="member-card__info">
                <h3 class="member-card__name">{{ m.name }}</h3>
                <p class="member-card__email">{{ m.email }}</p>
                <span class="badge badge--default member-card__id">{{ m.memberId }}</span>
              </div>
              <span class="badge" [class]="getStatusBadge(m.status)">{{ m.status }}</span>
            </div>
            <div class="member-card__divider"></div>
            <div class="member-card__details">
              <div class="member-detail">
                <span class="member-detail__label">Membership</span>
                <span class="badge" [class]="getTypeBadge(m.membershipType)">{{ m.membershipType }}</span>
              </div>
              <div class="member-detail">
                <span class="member-detail__label">Expires</span>
                <span class="member-detail__val">{{ m.membershipExpiry | date:'dd MMM y' }}</span>
              </div>
              <div class="member-detail">
                <span class="member-detail__label">Borrowed</span>
                <span class="member-detail__val">{{ m.borrowedCount }} books</span>
              </div>
              <div class="member-detail">
                <span class="member-detail__label">Fine</span>
                <span class="member-detail__val" [style.color]="m.fineAmount > 0 ? 'var(--crimson)' : 'var(--success)'">
                  {{ m.fineAmount > 0 ? '&#8377;' + m.fineAmount : 'Clear' }}
                </span>
              </div>
            </div>
            <div class="member-card__actions">
              <button class="btn btn--outline btn--sm" (click)="openModal(m)">Edit</button>
              @if (m.fineAmount > 0) {
                <button class="btn btn--teal btn--sm" (click)="initPayFine(m)">Pay Fine</button>
              }
              <button class="btn btn--ghost btn--sm" (click)="openDeleteModal(m)">Remove</button>
            </div>
          </div>
        }
        @if (filtered().length === 0) {
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-state__icon">&#128101;</div>
            <h3 class="empty-state__title">No members found</h3>
            <button class="btn btn--gold" (click)="clearFilters()">Clear filters</button>
          </div>
        }
      </div>
    </div>

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal--lg" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">{{ editing() ? 'Edit Member' : 'Register Member' }}</h3>
            <button class="modal__close" (click)="closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="form-grid">
              <div class="field">
                <label class="field__label">Full Name *</label>
                <input class="field__input" [(ngModel)]="form.name" placeholder="Member's full name" />
              </div>
              <div class="field">
                <label class="field__label">Email *</label>
                <input class="field__input" type="email" [(ngModel)]="form.email" placeholder="email@example.com" />
              </div>
              <div class="field">
                <label class="field__label">Phone</label>
                <input class="field__input" [(ngModel)]="form.phone" placeholder="10-digit number" />
              </div>
              <div class="field">
                <label class="field__label">Membership Type</label>
                <select class="field__input" [(ngModel)]="form.membershipType">
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label">Status</label>
                <select class="field__input" [(ngModel)]="form.status">
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label">Membership Expiry</label>
                <input class="field__input" type="date" [(ngModel)]="form.membershipExpiry" />
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn--gold" (click)="saveMember()">
              {{ editing() ? 'Save Changes' : 'Register Member' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="closeDeleteModal()">
        <div class="modal modal--sm" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Remove Member</h3>
            <button class="modal__close" (click)="closeDeleteModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <p style="color:var(--ink-40)">Remove <strong>{{ deleteTarget()!.name }}</strong>? This will delete all their records.</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeDeleteModal()">Cancel</button>
            <button class="btn btn--danger" (click)="doDelete()">Remove</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .toolbar { display:flex; gap:14px; align-items:center; margin-bottom:24px; flex-wrap:wrap; }
    .toolbar__search { width:280px; flex-shrink:0; }
    .status-filters { display:flex; gap:6px; flex-wrap:wrap; }
    .cat-pill {
      padding:6px 14px; border-radius:100px; font-size:13px; font-weight:500;
      border:1.5px solid var(--ink-10); background:transparent; cursor:pointer;
      color:var(--ink-40); transition:all var(--transition);
    }
    .cat-pill:hover { border-color:var(--ink-40); color:var(--ink); }
    .cat-pill--active { background:var(--ink); color:var(--paper); border-color:var(--ink); }

    .members-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }

    .member-card { background:white; border-radius:var(--r-lg); border:1px solid var(--ink-05); padding:20px; transition:all var(--transition); }
    .member-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
    .member-card__top { display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; }
    .member-avatar { width:46px; height:46px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:white; }
    .member-card__info { flex:1; min-width:0; }
    .member-card__name  { font-size:15px; font-weight:600; }
    .member-card__email { font-size:13px; color:var(--ink-40); margin:2px 0 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .member-card__id    { font-size:10px; }
    .member-card__divider { height:1px; background:var(--ink-05); margin-bottom:14px; }
    .member-card__details { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
    .member-detail { display:flex; flex-direction:column; gap:3px; }
    .member-detail__label { font-size:11px; color:var(--ink-40); text-transform:uppercase; letter-spacing:.06em; }
    .member-detail__val   { font-size:13px; font-weight:500; }
    .member-card__actions { display:flex; gap:8px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  `]
})
export class MembersComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  members      = signal<Member[]>(MOCK_MEMBERS);
  filtered     = signal<Member[]>(MOCK_MEMBERS);
  showModal    = signal(false);
  editing      = signal<Member | null>(null);
  deleteTarget = signal<Member | null>(null);
  activeStatus = signal('All');
  search       = '';
  statuses     = ['All', 'ACTIVE', 'SUSPENDED', 'EXPIRED'];
  form: Partial<Member> = {};

  private AVATAR_COLORS = ['#2a9d8f', '#c8a84b', '#8338ec', '#e76f51', '#457b9d', '#c1121f'];

  ngOnInit(): void {
    // this.api.getMembers().subscribe(ms => { this.members.set(ms); this.filtered.set(ms); });
  }

  // ── filter helpers ───────────────────────────────
  setStatus(s: string): void     { this.activeStatus.set(s); this.applyFilter(); }
  clearFilters(): void           { this.search = ''; this.activeStatus.set('All'); this.applyFilter(); }

  applyFilter(): void {
    const s  = this.search.toLowerCase();
    const st = this.activeStatus();
    this.filtered.set(
      this.members().filter(m =>
        (st === 'All' || m.status === st) &&
        (!s ||
          m.name.toLowerCase().includes(s) ||
          m.email.toLowerCase().includes(s) ||
          m.memberId.toLowerCase().includes(s)
        )
      )
    );
  }

  // ── modal helpers ────────────────────────────────
  openModal(m?: Member): void {
    this.editing.set(m ?? null);
    this.form = m
      ? { ...m }
      : { name: '', email: '', phone: '', membershipType: 'BASIC', status: 'ACTIVE', membershipExpiry: '' };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editing.set(null); }

  openDeleteModal(m: Member): void  { this.deleteTarget.set(m); }
  closeDeleteModal(): void          { this.deleteTarget.set(null); }

  // ── CRUD ─────────────────────────────────────────
  saveMember(): void {
    if (!this.form.name || !this.form.email) {
      this.toast.warn('Name and email are required.');
      return;
    }
    if (this.editing()) {
      this.members.update(ms =>
        ms.map(m => m.id === this.editing()!.id ? { ...m, ...this.form } as Member : m)
      );
      this.toast.success('Member updated!');
    } else {
      const next: Member = {
        ...this.form as Member,
        id: Date.now(),
        memberId: 'LIB' + String(Date.now()).slice(-4),
        borrowedCount: 0,
        fineAmount: 0,
        joinDate: new Date().toISOString().slice(0, 10),
      };
      this.members.update(ms => [next, ...ms]);
      this.toast.success('Member registered!');
    }
    this.applyFilter();
    this.closeModal();
  }

  doDelete(): void {
    const id = this.deleteTarget()!.id;
    this.members.update(ms => ms.filter(m => m.id !== id));
    this.applyFilter();
    this.toast.success('Member removed.');
    this.deleteTarget.set(null);
  }

  initPayFine(m: Member): void {
    this.toast.success(`Fine payment initiated for ${m.name}`);
  }

  // ── display helpers ──────────────────────────────
  getAvatarColor(name: string): string {
    return this.AVATAR_COLORS[name.charCodeAt(0) % this.AVATAR_COLORS.length];
  }

  getStatusBadge(s: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'badge--success', SUSPENDED: 'badge--danger', EXPIRED: 'badge--warning'
    };
    return map[s] ?? 'badge--default';
  }

  getTypeBadge(t: string): string {
    const map: Record<string, string> = {
      PREMIUM: 'badge--gold', BASIC: 'badge--default', STUDENT: 'badge--teal'
    };
    return map[t] ?? 'badge--default';
  }
}
