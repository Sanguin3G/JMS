import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ApiService } from 'src/app/core/http/api.service';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { AdminAccount, AdminCompany, EntityPage } from '../../services/entity-page';
import { AccountActions } from '../../services/account-actions';
import { CompanyViewComponent } from '../company-view/company-view.component';

import { signal } from '@angular/core';
import { ApiResponse } from 'src/app/core/http/api.service';
import { CurriculumVitae } from 'src/app/core/models/api.models';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';
import { ViewCvComponent } from 'src/app/shared/cv-viewer/view-cv.component';

@Component({ standalone: false, selector: 'app-candidate', templateUrl: './candidate.component.html', styleUrls: ['../entity-management.css'] })
export class CandidateComponent {
  private readonly dialog = inject(Dialog);
  private readonly api = inject(ApiService);
  private readonly notices = inject(NotificationService);
  readonly page = new EntityPage<AdminAccount>('candidates', this.api, inject(Router), inject(ActivatedRoute), inject(DestroyRef));
  readonly actions = new AccountActions('candidate', this.api, this.dialog, this.notices);
  readonly previewing = signal<number | null>(null);
  changeActive(account: AdminAccount): void { void this.actions.change(account, () => this.page.load()); }
  async openCVDialog(id: number): Promise<void> {
    if (this.previewing() !== null) return;
    this.previewing.set(id);
    try {
      const response = await this.api.getRequest<ApiResponse<CurriculumVitae[]>>(apiAdmin.GET_ALL_CV_BY_ID + id, AuthorizationMode.BEARER_TOKEN);
      if (response.statusCode !== 200) throw new Error(response.message || 'Không thể tải CV.');
      const cv = response.data?.find(item => item.isFindingJob);
      if (!cv) { this.notices.info('Ứng viên chưa chọn CV tìm việc.'); return; }
      const skill = (cv.skills || []).map(item => ({ title: item.title, SkillDescription: item.skillDescription }));
      const education = (cv.educations || []).map(item => ({ SchoolName: item.schoolName, MajorName: item.majorName, Description: item.description, FromYear: item.fromYear, ToYear: item.toYear, StillLearning: item.stillLearning }));
      const jobExperience = (cv.jobExperiences || []).map(item => ({ ComapanyName: (item as { comapanyName?: string }).comapanyName || item.ComapanyName, Position: item.position, FromDate: item.fromDate, ToDate: item.toDate, Description: item.description, EmploymentTypeName: item.employmentTypeName }));
      const project = (cv.projects || []).map(item => ({ ProjectName: item.projectName, Description: item.description, FromDate: item.fromDate, ToDate: item.toDate, IsStillWorking: item.isStillWorking }));
      const certificate = (cv.certificates || []).map(item => ({ CertificateName: item.certificateName, CertificateProvider: item.certificateProvider, credentialURL: item.credentialURL, ExpiredDate: item.expiredDate, IssuedDate: item.issuedDate }));
      const award = (cv.awards || []).map(item => ({ AwardName: item.awardName, Description: item.description, FromYear: item.fromYear }));
      const snapshot = { ...cv, skill: skill.length ? skill : [{}], education: education.length ? education : [{}],
        jobExperience: jobExperience.length ? jobExperience : [{}], project: project.length ? project : [{}],
        certificate: certificate.length ? certificate : [{}], award: award.length ? award : [{}], level: { description: cv.levelTitle } };
      this.dialog.open(ViewCvComponent, { width: 'min(860px, calc(100vw - 24px))', maxHeight: '95vh', ariaLabel: 'CV ứng viên', data: { jd: snapshot } });
    } catch (error) { this.notices.error(error instanceof Error ? error.message : 'Không thể tải CV.'); }
    finally { this.previewing.set(null); }
  }
}
