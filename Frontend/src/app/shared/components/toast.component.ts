import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast__icon">{{ icons[toast.type] }}</span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position:fixed; top:24px; right:24px; z-index:2000; display:flex; flex-direction:column; gap:10px; }
    .toast {
      display:flex; align-items:center; gap:10px; padding:14px 18px;
      background:white; border-radius:12px; box-shadow:0 24px 64px rgba(10,10,15,.16);
      border-left:4px solid var(--gold); font-size:14px; min-width:280px; max-width:380px;
      cursor:pointer; animation:slideDown .3s ease;
    }
    .toast--success { border-color:var(--teal); }
    .toast--error   { border-color:var(--crimson); }
    .toast--warn    { border-color:var(--gold); }
    .toast--info    { border-color:var(--ink-20); }
    .toast__icon    { font-size:18px; flex-shrink:0; }
    .toast__msg     { flex:1; line-height:1.4; }
    .toast__close   { background:none; border:none; color:var(--ink-20); cursor:pointer; font-size:12px; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
  icons: Record<string, string> = { success: '✓', error: '✕', warn: '⚠', info: 'ℹ' };
}
