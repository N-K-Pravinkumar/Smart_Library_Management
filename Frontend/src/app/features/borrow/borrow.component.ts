import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { BorrowRecord } from '../../shared/models';

const MOCK_BORROWS: BorrowRecord[] = [
  { id:1, bookId:1, bookTitle:'Atomic Habits',        bookAuthor:'James Clear',       memberId:1, memberName:'Priya Sharma',   borrowDate:'2024-03-01', dueDate:'2024-03-15', status:'ACTIVE' },
  { id:2, bookId:3, bookTitle:'Clean Code',           bookAuthor:'Robert C. Martin',  memberId:2, memberName:'Arjun Nair',     borrowDate:'2024-02-20', dueDate:'2024-03-05', status:'OVERDUE', fineAmount:120 },
  { id:3, bookId:4, bookTitle:'Sapiens',              bookAuthor:'Yuval Noah Harari', memberId:4, memberName:'Kiran Menon',    borrowDate:'2024-02-10', dueDate:'2024-02-24', status:'OVERDUE', fineAmount:240 },
  { id:4, bookId:2, bookTitle:'The Alchemist',        bookAuthor:'Paulo Coelho',      memberId:5, memberName:'Aditya Rao',     borrowDate:'2024-03-05', dueDate:'2024-03-19', status:'ACTIVE' },
  { id:5, bookId:6, bookTitle:'Deep Work',            bookAuthor:'Cal Newport',       memberId:3, memberName:'Riya Patel',     borrowDate:'2024-02-28', dueDate:'2024-03-13', status:'RETURNED', returnDate:'2024-03-10' },
  { id:6, bookId:8, bookTitle:'Psychology of Money',  bookAuthor:'Morgan Housel',     memberId:1, memberName:'Priya Sharma',   borrowDate:'2024-01-15', dueDate:'2024-01-29', status:'RETURNED', returnDate:'2024-01-27' },
];

@Component({
  selector: 'app-borrow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Borrow &amp; Return</h1>
          <p class="page-subtitle">Manage book lending records</p>
        </div>
        <button class="btn btn--gold" (click)="openBorrowModal()">+ New Borrow</button>
      </div>

      <div class="borrow-summary">
        <div class="summary-chip summary-chip--active">
          <span class="summary-chip__val">{{ countByStatus('ACTIVE') }}</span>
          <span class="summary-chip__label">Active</span>
        </div>
        <div class="summary-chip summary-chip--overdue">
          <span class="summary-chip__val">{{ countByStatus('OVERDUE') }}</span>
          <span class="summary-chip__label">Overdue</span>
        </div>
        <div class="summary-chip summary-chip--returned">
          <span class="summary-chip__val">{{ countByStatus('RETURNED') }}</span>
          <span class="summary-chip__label">Returned</span>
        </div>
        <div class="summary-chip summary-chip--fine">
          <span class="summary-chip__val">&#8377;{{ totalFines() }}</span>
          <span class="summary-chip__label">Total Fines</span>
        </div>
      </div>

      <div class="tab-bar">
        @for (tab of tabs; track tab.val) {
          <button class="tab" [class.tab--active]="activeTab() === tab.val" (click)="setTab(tab.val)">
            {{ tab.label }}
            <span class="tab__count">{{ tab.val === 'ALL' ? borrows().length : countByStatus(tab.val) }}</span>
          </button>
        }
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Member</th><th>Book</th><th>Borrowed</th><th>Due Date</th>
            <th>Status</th><th>Fine</th><th>Actions</th>
          </tr></thead>
          <tbody>
            @for (rec of filteredRecords(); track rec.id) {
              <tr [class.row--overdue]="rec.status === 'OVERDUE'">
                <td><strong>{{ rec.memberName }}</strong></td>
                <td>
                  <p style="font-weight:500;font-size:14px">{{ rec.bookTitle }}</p>
                  <p style="font-size:12px;color:var(--ink-40)">{{ rec.bookAuthor }}</p>
                </td>
                <td>{{ rec.borrowDate | date:'dd MMM y' }}</td>
                <td [style.color]="rec.status === 'OVERDUE' ? 'var(--crimson)' : 'inherit'">
                  {{ rec.dueDate | date:'dd MMM y' }}
                </td>
                <td><span class="badge" [class]="statusBadge(rec.status)">{{ rec.status }}</span></td>
                <td>
                  @if (rec.fineAmount && rec.fineAmount > 0) {
                    <span style="color:var(--crimson);font-weight:500">&#8377;{{ rec.fineAmount }}</span>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td>
                  <div style="display:flex;gap:6px">
                    @if (rec.status !== 'RETURNED') {
                      <button class="btn btn--teal btn--sm" (click)="returnBook(rec)">Return</button>
                    }
                    @if (rec.fineAmount && rec.fineAmount > 0) {
                      <button class="btn btn--outline btn--sm" (click)="payFine(rec)">Pay Fine</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showBorrowModal()) {
      <div class="modal-overlay" (click)="closeBorrowModal()">
        <div class="modal modal--md" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Issue Book</h3>
            <button class="modal__close" (click)="closeBorrowModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div style="display:flex;flex-direction:column;gap:18px">
              <div class="field">
                <label class="field__label">Member ID / Name</label>
                <input class="field__input" [(ngModel)]="newBorrow.memberName" placeholder="Search member…" />
              </div>
              <div class="field">
                <label class="field__label">Book Title / ISBN</label>
                <input class="field__input" [(ngModel)]="newBorrow.bookTitle" placeholder="Search book…" />
              </div>
              <div class="field">
                <label class="field__label">Due Date</label>
                <input class="field__input" type="date" [(ngModel)]="newBorrow.dueDate" />
              </div>
              <div class="borrow-note">
                <span>Standard lending period is 14 days. Late returns incur &#8377;10/day fine.</span>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeBorrowModal()">Cancel</button>
            <button class="btn btn--gold" (click)="issueBorrow()">Issue Book</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .borrow-summary { display:flex; gap:14px; margin-bottom:24px; flex-wrap:wrap; }
    .summary-chip { display:flex; flex-direction:column; align-items:center; padding:14px 24px; border-radius:var(--r-lg); border:1px solid var(--ink-05); background:white; min-width:100px; }
    .summary-chip__val { font-family:var(--font-display); font-size:24px; font-weight:600; }
    .summary-chip__label { font-size:12px; color:var(--ink-40); text-transform:uppercase; letter-spacing:.06em; margin-top:2px; }
    .summary-chip--active   .summary-chip__val { color:var(--teal); }
    .summary-chip--overdue  .summary-chip__val { color:var(--crimson); }
    .summary-chip--returned .summary-chip__val { color:var(--success); }
    .summary-chip--fine     .summary-chip__val { color:var(--gold-dark); }
    .tab-bar { display:flex; gap:4px; margin-bottom:20px; background:var(--paper-2); padding:4px; border-radius:var(--r-md); width:fit-content; }
    .tab { display:flex; align-items:center; gap:8px; padding:8px 18px; border-radius:8px; background:none; border:none; cursor:pointer; font-size:14px; font-weight:500; color:var(--ink-40); transition:all var(--transition); }
    .tab:hover { color:var(--ink); }
    .tab--active { background:white; color:var(--ink); box-shadow:var(--shadow-sm); }
    .tab__count { font-size:11px; background:var(--ink-05); color:var(--ink-40); padding:1px 7px; border-radius:100px; font-family:var(--font-mono); }
    .tab--active .tab__count { background:var(--gold); color:var(--ink); }
    .row--overdue td { background:rgba(193,18,31,.03); }
    .borrow-note { padding:12px 16px; background:var(--paper-2); border-radius:var(--r-md); font-size:13px; color:var(--ink-40); }
  `]
})
export class BorrowComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  borrows         = signal<BorrowRecord[]>(MOCK_BORROWS);
  activeTab       = signal('ALL');
  showBorrowModal = signal(false);
  newBorrow       = { memberName: '', bookTitle: '', dueDate: '' };

  tabs = [
    { label: 'All',      val: 'ALL' },
    { label: 'Active',   val: 'ACTIVE' },
    { label: 'Overdue',  val: 'OVERDUE' },
    { label: 'Returned', val: 'RETURNED' },
  ];

  ngOnInit(): void {
    // this.api.getBorrows().subscribe(b => this.borrows.set(b));
  }

  setTab(val: string): void         { this.activeTab.set(val); }
  openBorrowModal(): void           { this.showBorrowModal.set(true); }
  closeBorrowModal(): void          { this.showBorrowModal.set(false); }

  filteredRecords(): BorrowRecord[] {
    const t = this.activeTab();
    return t === 'ALL' ? this.borrows() : this.borrows().filter(b => b.status === t);
  }

  countByStatus(s: string): number  { return this.borrows().filter(b => b.status === s).length; }
  totalFines(): number              { return this.borrows().reduce((sum, b) => sum + (b.fineAmount ?? 0), 0); }

  returnBook(rec: BorrowRecord): void {
    this.borrows.update(bs => bs.map(b =>
      b.id === rec.id ? { ...b, status: 'RETURNED' as const, returnDate: new Date().toISOString().slice(0, 10) } : b
    ));
    this.toast.success(`"${rec.bookTitle}" returned successfully!`);
  }

  payFine(rec: BorrowRecord): void {
    this.toast.success(`Redirecting to payment for ₹${rec.fineAmount}…`);
  }

  issueBorrow(): void {
    if (!this.newBorrow.memberName || !this.newBorrow.bookTitle) {
      this.toast.warn('Please fill member and book fields.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const due   = this.newBorrow.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const rec: BorrowRecord = {
      id: Date.now(), bookId: 0,
      bookTitle: this.newBorrow.bookTitle, bookAuthor: '',
      memberId: 0, memberName: this.newBorrow.memberName,
      borrowDate: today, dueDate: due, status: 'ACTIVE'
    };
    this.borrows.update(bs => [rec, ...bs]);
    this.toast.success('Book issued successfully!');
    this.newBorrow = { memberName: '', bookTitle: '', dueDate: '' };
    this.showBorrowModal.set(false);
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = { ACTIVE: 'badge--success', OVERDUE: 'badge--danger', RETURNED: 'badge--default' };
    return map[s] ?? 'badge--default';
  }
}
