import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ViewCvComponent } from 'src/app/modules/candidate/components/view-cv/view-cv.component';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { showError, showSuccess } from 'src/app/service/common';
import { AVATAR_DEFAULT_URL, AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/service/api-requests';
import { MatchingExplanation, MatchingRecord, RecruiterCandidateDialogData } from 'src/app/core/models/api.models';
@Component({
  standalone: false,
   selector: 'app-list-candidate',
   templateUrl: './list-candidate.component.html',
   styleUrls: ['./list-candidate.component.css'],
})
export class ListCandidateComponent {
   avatar: any = AVATAR_DEFAULT_URL
   pageIndex: any = 0
   pageSize: any = 10
   listDisplay: MatchingRecord[] = []
   isShowLeftMatched: boolean = false
   isHideModal: boolean = false
   URL: any = environment.Url

   constructor(
      public dialogRef: MatDialogRef<ListCandidateComponent>,
      public dialogCvRef: MatDialogRef<ViewCvComponent>,
      public dialog: MatDialog,
      private toastr: ToastrService,
      @Inject(MAT_DIALOG_DATA) public data: RecruiterCandidateDialogData) {
      if (data.content?.length == 0) {
         data.content = null
      }
      this.getPageRange()
   }

   onClickSelect(item: MatchingRecord) {
      //call api update cv selected status
      postRequest(apiRecruiter.UPDATE_CV_SELECTED_STATUS + "?recruiterId=" + this.data.recruiterId + "&jobDescriptionId=" + item.jobDescriptionId + "&CVMatchingId=" + item.id, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               item.isSelected = !Boolean(item.isSelected)
            }
            console.log(res);
         })
         .catch(data => {
            console.log(data);
         })
   }

   async openListCandidateLeft(): Promise<void> {
      if (this.isShowLeftMatched == true) return;

      await getRequest<ApiResponse<MatchingRecord[]>>(apiRecruiter.GET_CV_MATCHED_LEFT, AuthorizationMode.BEARER_TOKEN, { recruiterId: this.data.recruiterId, jobDescriptionId: this.data.jdId })
         .then(res => {
            if (res.statusCode === 200 && res.data != null) {
               this.data.content = res.data
               this.getPageRange()
               this.isShowLeftMatched = true
            }
         })
         .catch(data => {
            console.warn(data);
         })
   }

   openViewCVModal(jd: MatchingRecord) {
      this.isHideModal = true
      const normalized = this.normalizeMatchingRecord(jd);

      const dialogRef = this.dialog.open(ViewCvComponent, {
         width: '50%',
         height: '100%',
         data: { jd: normalized, recruiterId: this.data.recruiterId }
      });

      dialogRef.afterClosed().subscribe(() => {
         this.isHideModal = false
      });
   }

   handlePage(e: PageEvent) {
      this.pageSize = e.pageSize;
      this.pageIndex = e.pageIndex;
      this.getPageRange();
   }

   getPageRange() {
      const start = this.pageIndex * this.pageSize;
      const content = this.data.content ?? [];
      const end = Math.min((this.pageIndex + 1) * this.pageSize, content.length);
      this.listDisplay = content.slice(start, end)
   }

   onClickRejectCv(cv: MatchingRecord) {
      //API handle delete JD
      postRequest(`${apiRecruiter.REJECT_CV}?recruiterId=${this.data.recruiterId}&jobDescriptionId=${this.data.jdId}&CVMatchingId=${cv.id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               showSuccess(this.toastr, "Xoá thành công hồ sơ")
               const index = this.listDisplay.indexOf(cv);
               if (index !== -1) {
                  this.listDisplay.splice(index, 1);
               }
            } else {
               showError(this.toastr, "Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
            }
         })
         .catch(data => {
            showError(this.toastr, "Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
         })
   }

   openConfirmDialog(jd: MatchingRecord): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
         width: '350px',
         data: { title: 'Xác nhận', content: 'Bạn có xác nhận xóa CV khỏi danh sách không?' }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
         if (result === true) {
            this.onClickRejectCv(jd);
         }
      });
   }

   private normalizeMatchingRecord(record: MatchingRecord): MatchingRecord {
      return {
         ...record,
         award: this.parseArray(record.award),
         certificate: this.parseArray(record.certificate),
         education: this.parseArray(record.education),
         jobExperience: this.parseArray(record.jobExperience),
         project: this.parseArray(record.project),
         skill: this.parseArray(record.skill),
         jsonMatching: this.parseExplanation(record.jsonMatching)
      };
   }

   private parseArray(value: unknown): unknown[] {
      if (Array.isArray(value)) return value;
      if (typeof value !== 'string' || value.trim().length === 0) return [];
      try {
         const parsed: unknown = JSON.parse(value);
         return Array.isArray(parsed) ? parsed : [];
      } catch {
         return [];
      }
   }

   private parseExplanation(value: unknown): MatchingExplanation | null {
      if (value && typeof value === 'object') return value as MatchingExplanation;
      if (typeof value !== 'string' || value.trim().length === 0) return null;
      try {
         const parsed: unknown = JSON.parse(value);
         return parsed && typeof parsed === 'object' ? parsed as MatchingExplanation : null;
      } catch {
         return null;
      }
   }
}
