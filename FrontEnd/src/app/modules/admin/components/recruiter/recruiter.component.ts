import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ApiService } from 'src/app/core/http/api.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { AdminAccount, AdminCompany, EntityPage } from '../../services/entity-page';
import { AccountActions } from '../../services/account-actions';
import { CompanyViewComponent } from '../company-view/company-view.component';

@Component({ standalone: false, selector: 'app-recruiter', templateUrl: './recruiter.component.html', styleUrls: ['../entity-management.css'] })
export class RecruiterComponent {
  private readonly dialog = inject(Dialog);
  private readonly api = inject(ApiService);
  readonly page = new EntityPage<AdminAccount>('recruiters', this.api, inject(Router), inject(ActivatedRoute), inject(DestroyRef));
  readonly actions = new AccountActions('recruiter', this.api, this.dialog, inject(NotificationService));
  changeActive(account: AdminAccount): void { void this.actions.change(account, () => this.page.load()); }
  openCompanyDialog(id: number): void { this.dialog.open(CompanyViewComponent, { width: 'min(960px, calc(100vw - 24px))', maxHeight: '90vh', ariaLabel: 'Chi tiết công ty', data: id }); }
}
