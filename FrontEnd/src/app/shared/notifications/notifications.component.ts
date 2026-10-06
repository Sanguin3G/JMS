import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from 'src/app/core/notifications/notification.service';
@Component({
  selector: 'jms-notifications', standalone: true, imports: [CommonModule],
  template: `<div class="notifications" aria-live="polite" aria-atomic="false"><div *ngFor="let notice of notifications.notices()" class="notice" [attr.data-kind]="notice.kind"><i [class]="notice.kind === 'error' ? 'bi bi-exclamation-circle' : 'bi bi-info-circle'" aria-hidden="true"></i><span>{{notice.message}}</span><button type="button" (click)="notifications.dismiss(notice.id)" aria-label="Đóng thông báo"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div></div>`,
  styles: [`.notifications { position:fixed; bottom:1rem; right:1rem; width:min(400px,calc(100vw - 2rem)); z-index:2000; display:grid; gap:.6rem; }.notice { display:flex; align-items:center; gap:.8rem; padding:1rem; color:var(--text-primary); background:var(--surface-primary); border:1px solid var(--border-medium); border-left:4px solid var(--accent); border-radius:.7rem; box-shadow:var(--boxShadow); }.notice[data-kind=error] { border-left-color:var(--jms-danger,#d64055); }.notice[data-kind=success] { border-left-color:var(--jms-success,#168556); }.notice span { flex:1; }.notice button { background:transparent; color:inherit; padding:.3rem; }`],
})
export class NotificationsComponent { readonly notifications = inject(NotificationService); }
