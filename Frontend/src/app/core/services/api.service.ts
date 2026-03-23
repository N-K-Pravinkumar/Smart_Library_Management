import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  AuthResponse,
  Book,
  BookFilter,
  Member,
  BorrowRecord,
  BorrowRequest,
  Payment,
  MembershipPlan,
  PaymentIntent,
  DashboardStats,
  ActivityItem,
  PagedResponse,
} from "../../shared/models";

@Injectable({ providedIn: "root" })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Auth ────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password });
  }
  register(
    data: Partial<Member> & { password: string },
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, data);
  }
  getProfile(): Observable<AuthResponse["user"]> {
    return this.http.get<AuthResponse["user"]>(`${this.base}/auth/me`);
  }

  // ─── Books ───────────────────────────────────────
  getBooks(filter: BookFilter = {}): Observable<PagedResponse<Book>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined) params = params.set(k, String(v));
    });
    return this.http.get<PagedResponse<Book>>(`${this.base}/books`, { params });
  }
  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.base}/books/${id}`);
  }
  createBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(`${this.base}/books`, book);
  }
  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.base}/books/${id}`, book);
  }
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/books/${id}`);
  }

  // ─── Members ─────────────────────────────────────
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.base}/members`);
  }
  getMember(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.base}/members/${id}`);
  }
  createMember(m: Partial<Member>): Observable<Member> {
    return this.http.post<Member>(`${this.base}/members`, m);
  }
  updateMember(id: number, m: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.base}/members/${id}`, m);
  }
  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/members/${id}`);
  }

  // ─── Borrow ──────────────────────────────────────
  getBorrows(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.base}/borrows`);
  }
  getActiveBorrows(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.base}/borrows/active`);
  }
  getOverdueBorrows(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.base}/borrows/overdue`);
  }
  borrowBook(req: BorrowRequest): Observable<BorrowRecord> {
    return this.http.post<BorrowRecord>(`${this.base}/borrows`, req);
  }
  returnBook(borrowId: number): Observable<BorrowRecord> {
    return this.http.put<BorrowRecord>(
      `${this.base}/borrows/${borrowId}/return`,
      {},
    );
  }

  // ─── Payments ────────────────────────────────────
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/payments`);
  }
  getMemberPayments(memberId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/payments/member/${memberId}`);
  }
  createPaymentIntent(data: {
    amount: number;
    type: string;
    referenceId?: number;
  }): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.base}/payments/create-intent`,
      data,
    );
  }
  confirmPayment(data: {
    paymentIntentId: string;
    paymentMethodId: string;
  }): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/payments/confirm`, data);
  }
  getMembershipPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>(
      `${this.base}/payments/membership/plans`,
    );
  }
  subscribeMembership(data: {
    planId: string;
    memberId: number;
    paymentMethodId: string;
  }): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.base}/payments/membership/subscribe`,
      data,
    );
  }
  getMemberFines(memberId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/payments/fines/${memberId}`);
  }

  // ─── Dashboard ───────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats/dashboard`);
  }
  getRecentActivity(): Observable<ActivityItem[]> {
    return this.http.get<ActivityItem[]>(`${this.base}/stats/activity`);
  }
}
