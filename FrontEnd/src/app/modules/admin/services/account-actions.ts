import { signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'src/app/core/http/api.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';
import { AdminAccount } from './entity-page';

export class AccountActions {
  readonly busyId = signal<number | null>(null);
  constructor(private readonly kind: 'candidate' | 'recruiter', private readonly api: ApiService,
    private readonly dialog: Dialog, private readonly notices: NotificationService) {}
  async change(account: AdminAccount, reload: () => Promise<void>): Promise<void> {
    if (this.busyId() !== null) return;
    this.busyId.set(account.id);
    try {
      const confirmed = await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent, {
        width: 'min(420px, calc(100vw - 32px))', data: { title: account.isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
          content: `${account.isActive ? 'Khóa' : 'Mở khóa'} tài khoản của ${account.fullName}?` }
      }).closed);
      if (!confirmed) return;
      const endpoint = this.kind === 'candidate' ? apiAdmin.CHANGE_ACTIVE_CANDIDATE : apiAdmin.CHANGE_ACTIVE_RECRUITER;
      const response = await this.api.postRequest(endpoint + account.id, AuthorizationMode.BEARER_TOKEN, {});
      if (response.statusCode !== 200) throw new Error(response.message || 'Không thể cập nhật trạng thái.');
      this.notices.success(account.isActive ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.'); await reload();
    } catch (error) { this.notices.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái.'); }
    finally { this.busyId.set(null); }
  }
}
