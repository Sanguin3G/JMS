import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
export interface UnsavedChanges { hasUnsavedChanges(): boolean; }
export const unsavedChangesGuard: CanDeactivateFn<UnsavedChanges> = component => {
  if (!component.hasUnsavedChanges()) return true;
  return firstValueFrom(inject(Dialog).open<boolean>(ConfirmDialogComponent, { width: '420px', maxWidth: '95vw', data: { title: 'Rời trang chỉnh sửa?', content: 'Bạn có thay đổi chưa lưu. Rời trang sẽ bỏ những thay đổi này.' } }).closed).then(confirmed => confirmed === true);
};
