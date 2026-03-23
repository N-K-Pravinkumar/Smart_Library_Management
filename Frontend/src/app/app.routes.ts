import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login',    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'books',     loadComponent: () => import('./features/books/books.component').then(m => m.BooksComponent) },
      { path: 'members',   loadComponent: () => import('./features/members/members.component').then(m => m.MembersComponent) },
      { path: 'borrow',    loadComponent: () => import('./features/borrow/borrow.component').then(m => m.BorrowComponent) },
      { path: 'payments',  loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'reports',   loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent), canActivate: [adminGuard] },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
