// ─── Auth ──────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Books ─────────────────────────────────────────
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publishYear: number;
  description?: string;
  coverUrl?: string;
  location?: string;
}

export interface BookFilter {
  search?: string;
  category?: string;
  available?: boolean;
  page?: number;
  size?: number;
}

// ─── Members ───────────────────────────────────────
export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberId: string;
  membershipType: 'BASIC' | 'PREMIUM' | 'STUDENT';
  membershipExpiry: string;
  borrowedCount: number;
  fineAmount: number;
  joinDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

// ─── Borrow ────────────────────────────────────────
export interface BorrowRecord {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  memberId: number;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  fineAmount?: number;
}

export interface BorrowRequest {
  bookId: number;
  memberId: number;
  dueDays?: number;
}

// ─── Payments ──────────────────────────────────────
export interface Payment {
  id: number;
  memberId: number;
  memberName: string;
  type: 'FINE' | 'MEMBERSHIP' | 'RESERVATION';
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  description: string;
  createdAt: string;
  paidAt?: string;
  stripePaymentIntentId?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // months
  features: string[];
  popular?: boolean;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

// ─── Dashboard ─────────────────────────────────────
export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalRevenue: number;
  newMembersThisMonth: number;
}

export interface ActivityItem {
  id: number;
  type: 'borrow' | 'return' | 'payment' | 'new_member' | 'overdue';
  memberName: string;
  description: string;
  timestamp: string;
}

// ─── API Response ──────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
