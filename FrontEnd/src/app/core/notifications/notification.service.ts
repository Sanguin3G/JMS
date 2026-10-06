import { Injectable, signal } from '@angular/core';
export type NoticeKind = 'success' | 'error' | 'info' | 'warning';
export interface Notice { id: number; message: string; kind: NoticeKind; }
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notices = signal<Notice[]>([]);
  private nextId = 0;
  success(message: string): void { this.show('success', message); }
  error(message: string): void { this.show('error', message); }
  info(message: string): void { this.show('info', message); }
  warning(message: string): void { this.show('warning', message); }
  dismiss(id: number): void { this.notices.update(items => items.filter(item => item.id !== id)); }
  private show(kind: NoticeKind, message: string): void {
    const id = ++this.nextId;
    this.notices.update(items => [...items.slice(-3), { id, kind, message }]);
    setTimeout(() => this.dismiss(id), kind === 'error' ? 8000 : 5000);
  }
}
