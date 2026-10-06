import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CurriculumVitae } from 'src/app/core/models/api.models';
import { apiCandidate, AuthorizationMode } from 'src/app/service/constant';
import { ViewCvComponent } from '../cv-viewer/view-cv.component';
@Component({
  selector: 'jms-cv-preview', standalone: true, imports: [CommonModule, RouterLink, DialogModule],
  template: `<main class="container py-4"><a routerLink="/candidate/your-cvs">← Hồ sơ của bạn</a><h1 class="mt-4">Xem CV</h1><p *ngIf="loading" role="status">Đang tải hồ sơ…</p><p *ngIf="error" role="alert">{{error}}</p><div *ngIf="cv"><h2>{{cv.cvTitle}}</h2><button class="btn btn-primary me-2" type="button" (click)="preview()">Mở bản xem trước</button><a class="btn btn-outline-primary" [routerLink]="['/candidate/update-cv', cv.id]">Chỉnh sửa</a></div></main>`,
})
export class CvPreviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
  cv: CurriculumVitae | null = null;
  loading = true;
  error = '';
  async ngOnInit(): Promise<void> {
    try {
      const result = await this.api.getRequest<ApiResponse<CurriculumVitae>>(`${apiCandidate.GET_CV_CANDIDATE_BY_ID}/${this.auth.getProfile()?.id}/${this.route.snapshot.paramMap.get('id')}`, AuthorizationMode.BEARER_TOKEN);
      if (result.statusCode !== 200 || !result.data) throw new Error();
      this.cv = result.data;
      this.preview();
    } catch { this.error = 'Không thể tải hồ sơ. Hồ sơ có thể đã bị xóa.'; }
    finally { this.loading = false; }
  }
  preview(): void { if (this.cv) this.dialog.open(ViewCvComponent, { width: '960px', maxWidth: '96vw', data: { jd: { ...this.cv, skill: this.cv.skills ?? [], education: this.cv.educations ?? [], jobExperience: this.cv.jobExperiences ?? [], project: this.cv.projects ?? [], certificate: this.cv.certificates ?? [], award: this.cv.awards ?? [] } } }); }
}
