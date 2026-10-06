import { I18nModule } from '../../core/i18n/i18n.module';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ImageFallbackDirective } from '../image-fallback/image-fallback.directive';
@Component({ selector: 'jms-account-menu', standalone: true, imports: [I18nModule, CommonModule, RouterModule, CdkMenuModule, ImageFallbackDirective], templateUrl: './account-menu.component.html', styleUrls: ['./account-menu.component.css'] })
export class AccountMenuComponent {
  @Input() name: string | undefined = '';
  @Input() avatar: string | null | undefined;
  @Input() userRole: 'candidate' | 'recruiter' | 'admin' = 'candidate';
  @Output() signedOut = new EventEmitter<void>();
  get roleName() { return { candidate: 'Ứng viên', recruiter: 'Nhà tuyển dụng', admin: 'Quản trị viên' }[this.userRole]; }
}
