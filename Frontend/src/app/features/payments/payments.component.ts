import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Payment, MembershipPlan } from '../../shared/models';

const MOCK_PAYMENTS: Payment[] = [
  { id:1, memberId:2, memberName:'Arjun Nair',   type:'FINE',       amount:120, status:'PENDING', description:'Overdue fine for Clean Code',      createdAt:'2024-03-05' },
  { id:2, memberId:4, memberName:'Kiran Menon',   type:'FINE',       amount:240, status:'PENDING', description:'Overdue fine for Sapiens',         createdAt:'2024-02-25' },
  { id:3, memberId:1, memberName:'Priya Sharma',  type:'MEMBERSHIP', amount:999, status:'PAID',    description:'Premium membership - 1 year',     createdAt:'2024-01-10', paidAt:'2024-01-10' },
  { id:4, memberId:3, memberName:'Riya Patel',    type:'MEMBERSHIP', amount:299, status:'PAID',    description:'Student membership - 6 months',   createdAt:'2024-01-05', paidAt:'2024-01-05' },
  { id:5, memberId:5, memberName:'Aditya Rao',    type:'FINE',       amount:60,  status:'PAID',    description:'Overdue fine for Deep Work',       createdAt:'2024-02-18', paidAt:'2024-02-18' },
];

const PLANS: MembershipPlan[] = [
  { id:'student', name:'Student',  price:299,  duration:6,  features:['5 books at a time','14-day lending','Basic catalogue access','Email support'] },
  { id:'basic',   name:'Basic',    price:499,  duration:12, features:['8 books at a time','21-day lending','Full catalogue access','Priority support'], popular:false },
  { id:'premium', name:'Premium',  price:999,  duration:12, features:['Unlimited books','30-day lending','Full catalogue + e-books','24/7 support','Home delivery'], popular:true },
];

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payments</h1>
          <p class="page-subtitle">Fines, memberships & transaction history</p>
        </div>
      </div>

      <!-- Revenue summary -->
      <div class="rev-cards">
        <div class="rev-card">
          <div class="rev-card__icon">💳</div>
          <div>
            <p class="rev-card__label">Total Collected</p>
            <p class="rev-card__val">₹{{ totalCollected() | number }}</p>
          </div>
        </div>
        <div class="rev-card">
          <div class="rev-card__icon">⏳</div>
          <div>
            <p class="rev-card__label">Pending</p>
            <p class="rev-card__val" style="color:var(--crimson)">₹{{ totalPending() | number }}</p>
          </div>
        </div>
        <div class="rev-card">
          <div class="rev-card__icon">👥</div>
          <div>
            <p class="rev-card__label">Membership Revenue</p>
            <p class="rev-card__val">₹{{ membershipRevenue() | number }}</p>
          </div>
        </div>
        <div class="rev-card">
          <div class="rev-card__icon">⚠️</div>
          <div>
            <p class="rev-card__label">Fine Revenue</p>
            <p class="rev-card__val">₹{{ fineRevenue() | number }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab" [class.tab--active]="activeTab()==='transactions'" (click)="setTab('transactions')">Transactions</button>
        <button class="tab" [class.tab--active]="activeTab()==='pending'" (click)="setTab('pending')">
          Pending Fines
          <span class="tab__badge">{{ pendingFines().length }}</span>
        </button>
        <button class="tab" [class.tab--active]="activeTab()==='membership'" (click)="setTab('membership')">Membership Plans</button>
      </div>

      <!-- Transactions tab -->
      @if (activeTab() === 'transactions') {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr>
              <th>Member</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th>
            </tr></thead>
            <tbody>
              @for (p of payments(); track p.id) {
                <tr>
                  <td><strong>{{ p.memberName }}</strong></td>
                  <td><span class="badge" [class]="typeBadge(p.type)">{{ p.type }}</span></td>
                  <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.description }}</td>
                  <td style="font-weight:600;font-family:var(--font-mono)">₹{{ p.amount }}</td>
                  <td><span class="badge" [class]="statusBadge(p.status)">{{ p.status }}</span></td>
                  <td>{{ (p.paidAt || p.createdAt) | date:'dd MMM y' }}</td>
                  <td>
                    @if (p.status === 'PENDING') {
                      <button class="btn btn--gold btn--sm" (click)="openPayment(p)">Collect</button>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Pending fines tab -->
      @if (activeTab() === 'pending') {
        <div class="pending-list">
          @if (pendingFines().length === 0) {
            <div class="empty-state">
              <div class="empty-state__icon">✅</div>
              <h3 class="empty-state__title">No pending fines</h3>
              <p class="empty-state__desc">All members are up to date!</p>
            </div>
          }
          @for (p of pendingFines(); track p.id) {
            <div class="pending-card">
              <div class="pending-card__left">
                <div class="pending-avatar">{{ p.memberName[0] }}</div>
                <div>
                  <p class="pending-name">{{ p.memberName }}</p>
                  <p class="pending-desc">{{ p.description }}</p>
                </div>
              </div>
              <div class="pending-card__right">
                <p class="pending-amount">₹{{ p.amount }}</p>
                <button class="btn btn--gold btn--sm" (click)="openPayment(p)">Pay Now</button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Membership plans tab -->
      @if (activeTab() === 'membership') {
        <div class="plans-grid">
          @for (plan of plans; track plan.id) {
            <div class="plan-card" [class.plan-card--popular]="plan.popular">
              @if (plan.popular) {
                <div class="plan-badge">Most Popular</div>
              }
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="plan-price__symbol">₹</span>
                <span class="plan-price__val">{{ plan.price }}</span>
                <span class="plan-price__per">/{{ plan.duration }} months</span>
              </div>
              <ul class="plan-features">
                @for (f of plan.features; track f) {
                  <li class="plan-feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {{ f }}
                  </li>
                }
              </ul>
              <button class="btn btn--lg" [class]="plan.popular ? 'btn--gold' : 'btn--outline'" style="width:100%;justify-content:center"
                (click)="subscribePlan(plan)">
                Subscribe
              </button>
            </div>
          }
        </div>
      }
    </div>

    <!-- Payment Modal (Stripe-style) -->
    @if (paymentModal()) {
      <div class="modal-overlay" (click)="closePaymentModal()">
        <div class="modal modal--md" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Collect Payment</h3>
            <button class="modal__close" (click)="closePaymentModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <!-- Amount summary -->
            <div class="pay-summary">
              <div class="pay-summary__row">
                <span>Member</span><strong>{{ paymentModal()!.memberName }}</strong>
              </div>
              <div class="pay-summary__row">
                <span>Description</span><span>{{ paymentModal()!.description }}</span>
              </div>
              <div class="pay-summary__row pay-summary__row--total">
                <span>Total</span><strong>₹{{ paymentModal()!.amount }}</strong>
              </div>
            </div>

            <!-- Stripe card element simulation -->
            <div class="stripe-section">
              <p class="stripe-label">Payment Details</p>
              <div class="stripe-card-mock">
                <div class="field">
                  <label class="field__label">Card Number</label>
                  <input class="field__input" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242"
                    (input)="formatCard($event)" maxlength="19" />
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
                  <div class="field">
                    <label class="field__label">Expiry</label>
                    <input class="field__input" [(ngModel)]="cardExpiry" placeholder="MM / YY" maxlength="7" />
                  </div>
                  <div class="field">
                    <label class="field__label">CVV</label>
                    <input class="field__input" [(ngModel)]="cardCvv" placeholder="•••" maxlength="3" type="password" />
                  </div>
                </div>
              </div>
              <div class="stripe-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Payments secured by Stripe. Use 4242 4242 4242 4242 for testing.
              </div>
            </div>

            <!-- UPI option -->
            <div class="pay-alt">
              <div class="pay-alt__divider"><span>or pay via</span></div>
              <div class="upi-options">
                @for (upi of upiOptions; track upi) {
                  <button class="upi-btn" (click)="payViaUPI(upi)">{{ upi }}</button>
                }
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closePaymentModal()">Cancel</button>
            <button class="btn btn--gold" (click)="processPayment()" [disabled]="processing()">
              @if (processing()) {
                <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                Processing…
              } @else {
                Pay ₹{{ paymentModal()!.amount }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Membership subscribe modal -->
    @if (subscribeModal()) {
      <div class="modal-overlay" (click)="closeSubscribeModal()">
        <div class="modal modal--md" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Subscribe — {{ subscribeModal()!.name }} Plan</h3>
            <button class="modal__close" (click)="closeSubscribeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="pay-summary" style="margin-bottom:20px">
              <div class="pay-summary__row">
                <span>Plan</span><strong>{{ subscribeModal()!.name }}</strong>
              </div>
              <div class="pay-summary__row">
                <span>Duration</span><span>{{ subscribeModal()!.duration }} months</span>
              </div>
              <div class="pay-summary__row pay-summary__row--total">
                <span>Total</span><strong>₹{{ subscribeModal()!.price }}</strong>
              </div>
            </div>
            <div class="field" style="margin-bottom:16px">
              <label class="field__label">Member ID or Name</label>
              <input class="field__input" [(ngModel)]="subMemberName" placeholder="Search member…" />
            </div>
            <div class="stripe-card-mock">
              <div class="field">
                <label class="field__label">Card Number</label>
                <input class="field__input" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" />
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeSubscribeModal()">Cancel</button>
            <button class="btn btn--gold" (click)="confirmSubscription()" [disabled]="processing()">
              {{ processing() ? 'Processing…' : 'Confirm ₹' + subscribeModal()!.price }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .rev-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    @media(max-width:900px){ .rev-cards{ grid-template-columns:1fr 1fr; } }
    .rev-card { background:white; border:1px solid var(--ink-05); border-radius:var(--r-lg); padding:20px; display:flex; gap:14px; align-items:flex-start; transition:all var(--transition); }
    .rev-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
    .rev-card__icon { font-size:22px; }
    .rev-card__label { font-size:13px; color:var(--ink-40); margin-bottom:4px; }
    .rev-card__val { font-size:22px; font-weight:600; font-family:var(--font-display); }

    .tab-bar { display:flex; gap:4px; margin-bottom:20px; background:var(--paper-2); padding:4px; border-radius:var(--r-md); width:fit-content; }
    .tab { display:flex; align-items:center; gap:8px; padding:8px 18px; border-radius:8px; background:none; border:none; cursor:pointer; font-size:14px; font-weight:500; color:var(--ink-40); transition:all var(--transition); }
    .tab:hover { color:var(--ink); }
    .tab--active { background:white; color:var(--ink); box-shadow:0 2px 8px rgba(10,10,15,.07); }
    .tab__badge { background:var(--crimson); color:white; font-size:11px; padding:1px 7px; border-radius:100px; }

    .pending-list { display:flex; flex-direction:column; gap:12px; }
    .pending-card { background:white; border:1px solid var(--ink-05); border-radius:var(--r-lg); padding:18px 22px; display:flex; justify-content:space-between; align-items:center; }
    .pending-card__left { display:flex; align-items:center; gap:14px; }
    .pending-avatar { width:40px; height:40px; border-radius:50%; background:rgba(193,18,31,.1); color:var(--crimson); display:flex; align-items:center; justify-content:center; font-weight:700; }
    .pending-name  { font-size:15px; font-weight:500; }
    .pending-desc  { font-size:13px; color:var(--ink-40); }
    .pending-card__right { display:flex; align-items:center; gap:16px; }
    .pending-amount { font-family:var(--font-display); font-size:22px; font-weight:600; color:var(--crimson); }

    .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
    @media(max-width:900px){ .plans-grid{ grid-template-columns:1fr; } }
    .plan-card { background:white; border:2px solid var(--ink-05); border-radius:var(--r-xl); padding:28px; position:relative; transition:all var(--transition); }
    .plan-card:hover { box-shadow:var(--shadow-md); transform:translateY(-3px); }
    .plan-card--popular { border-color:var(--gold); }
    .plan-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--gold); color:var(--ink); font-size:11px; font-weight:600; padding:4px 16px; border-radius:100px; white-space:nowrap; }
    .plan-name  { font-family:var(--font-display); font-size:20px; margin-bottom:12px; }
    .plan-price { display:flex; align-items:baseline; gap:3px; margin-bottom:20px; }
    .plan-price__symbol { font-size:18px; color:var(--ink-40); }
    .plan-price__val    { font-family:var(--font-display); font-size:36px; font-weight:700; }
    .plan-price__per    { font-size:14px; color:var(--ink-40); }
    .plan-features { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
    .plan-feature { display:flex; align-items:center; gap:8px; font-size:14px; color:var(--ink-40); }
    .plan-feature svg { stroke:var(--teal); flex-shrink:0; }

    .pay-summary { background:var(--paper-2); border-radius:var(--r-md); padding:16px; margin-bottom:20px; }
    .pay-summary__row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:14px; color:var(--ink-40); }
    .pay-summary__row--total { border-top:1px solid var(--ink-10); margin-top:8px; padding-top:12px; color:var(--ink); font-size:16px; }
    .pay-summary__row--total strong { font-family:var(--font-display); font-size:20px; }

    .stripe-section { margin-bottom:20px; }
    .stripe-label { font-size:13px; font-weight:500; color:var(--ink-40); margin-bottom:10px; }
    .stripe-card-mock { background:var(--paper); border:1.5px solid var(--ink-10); border-radius:var(--r-md); padding:16px; }
    .stripe-note { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--ink-20); margin-top:12px; }

    .pay-alt { }
    .pay-alt__divider { text-align:center; position:relative; margin:16px 0; }
    .pay-alt__divider::before { content:''; position:absolute; top:50%; left:0; right:0; height:1px; background:var(--ink-05); }
    .pay-alt__divider span { position:relative; background:white; padding:0 12px; font-size:12px; color:var(--ink-20); }
    .upi-options { display:flex; gap:10px; flex-wrap:wrap; }
    .upi-btn { padding:8px 16px; border:1.5px solid var(--ink-10); border-radius:var(--r-md); background:white; cursor:pointer; font-size:13px; transition:all var(--transition); color:var(--ink); }
    .upi-btn:hover { border-color:var(--gold); background:rgba(200,168,75,.05); }
  `]
})
export class PaymentsComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  payments      = signal<Payment[]>(MOCK_PAYMENTS);
  activeTab     = signal<'transactions'|'pending'|'membership'>('transactions');
  paymentModal  = signal<Payment | null>(null);
  subscribeModal = signal<MembershipPlan | null>(null);
  processing    = signal(false);
  plans         = PLANS;
  upiOptions    = ['GPay', 'PhonePe', 'Paytm', 'UPI ID'];

  cardNumber  = '';
  cardExpiry  = '';
  cardCvv     = '';
  subMemberName = '';

  ngOnInit() {
    // this.api.getPayments().subscribe(p => this.payments.set(p));
  }

  pendingFines() { return this.payments().filter(p => p.status === 'PENDING'); }
  totalCollected() { return this.payments().filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0); }
  totalPending()   { return this.payments().filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0); }
  membershipRevenue() { return this.payments().filter(p => p.status === 'PAID' && p.type === 'MEMBERSHIP').reduce((s, p) => s + p.amount, 0); }
  fineRevenue()    { return this.payments().filter(p => p.status === 'PAID' && p.type === 'FINE').reduce((s, p) => s + p.amount, 0); }

  setTab(val: string): void { this.activeTab.set(val as any); }
  closePaymentModal(): void { this.paymentModal.set(null); }
  closeSubscribeModal(): void { this.subscribeModal.set(null); }

  openPayment(p: Payment) { this.paymentModal.set(p); this.cardNumber = ''; this.cardExpiry = ''; this.cardCvv = ''; }

  formatCard(e: Event) {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = val.match(/.{1,4}/g)?.join(' ') ?? val;
  }

  processPayment() {
    const p = this.paymentModal();
    if (!p) return;
    if (this.cardNumber.replace(/\s/g,'').length < 16) { this.toast.warn('Enter a valid card number.'); return; }
    this.processing.set(true);

    // In production: call this.api.createPaymentIntent({ amount: p.amount, type: p.type })
    // then confirm with Stripe.js confirmCardPayment()
    setTimeout(() => {
      this.payments.update(ps => ps.map(x => x.id === p.id ? { ...x, status: 'PAID' as const, paidAt: new Date().toISOString().slice(0,10) } : x));
      this.toast.success(`Payment of ₹${p.amount} collected from ${p.memberName}!`);
      this.processing.set(false);
      this.paymentModal.set(null);
    }, 1800);
  }

  subscribePlan(plan: MembershipPlan) { this.subscribeModal.set(plan); this.subMemberName = ''; this.cardNumber = ''; }

  confirmSubscription() {
    const plan = this.subscribeModal();
    if (!plan || !this.subMemberName) { this.toast.warn('Enter member name.'); return; }
    this.processing.set(true);
    setTimeout(() => {
      const newPayment: Payment = {
        id: Date.now(), memberId: 0, memberName: this.subMemberName,
        type: 'MEMBERSHIP', amount: plan.price, status: 'PAID',
        description: `${plan.name} membership - ${plan.duration} months`,
        createdAt: new Date().toISOString().slice(0,10), paidAt: new Date().toISOString().slice(0,10)
      };
      this.payments.update(ps => [newPayment, ...ps]);
      this.toast.success(`${plan.name} membership activated for ${this.subMemberName}!`);
      this.processing.set(false);
      this.subscribeModal.set(null);
    }, 1500);
  }

  payViaUPI(method: string) { this.toast.success(`Opening ${method}…`); }

  typeBadge(t: string)   { return ({ FINE:'badge--danger', MEMBERSHIP:'badge--gold', RESERVATION:'badge--teal' } as any)[t] ?? 'badge--default'; }
  statusBadge(s: string) { return ({ PAID:'badge--success', PENDING:'badge--warning', FAILED:'badge--danger' } as any)[s] ?? 'badge--default'; }
}
