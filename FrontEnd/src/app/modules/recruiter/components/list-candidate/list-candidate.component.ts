import { parseMatchingExplanation } from 'src/app/core/jobs/matching-explanation';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { inject, Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA, Dialog } from '@angular/cdk/dialog';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ViewCvComponent } from 'src/app/shared/cv-viewer/view-cv.component';


import { AVATAR_DEFAULT_URL, AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { environment } from 'src/environments/environment';

import { MatchingExplanation, MatchingRecord, RecruiterCandidateDialogData } from 'src/app/core/models/api.models';
@Component({
  standalone: false,
   selector: 'app-list-candidate',
   templateUrl: './list-candidate.component.html',
   styleUrls: ['./list-candidate.component.css'],
})
export class ListCandidateComponent {
   private readonly api = inject(ApiService);
   avatar: any = AVATAR_DEFAULT_URL
   pageIndex: any = 0
   pageSize: any = 10
   listDisplay: MatchingRecord[] = []
   isShowLeftMatched: boolean = false
   isHideModal: boolean = false
   URL: any = environment.Url

   constructor(
      public dialogRef: DialogRef<unknown, ListCandidateComponent>,
      public dialog: Dialog,
      private toastr: NotificationService,
      @Inject(DIALOG_DATA) public data: RecruiterCandidateDialogData) {
      if (data.content?.length == 0) {
         data.content = null
      }
      if (data.content) {
         data.content = data.content.map(candidate => this.normalizeMatchingRecord(candidate));
      }
      this.getPageRange()
   }

   pendingId: number | null = null;

   onClickSelect(item: MatchingRecord) {
      if (this.pendingId !== null) return;
      this.pendingId = item.id;
      //call api update cv selected status
      this.api.postRequest(apiRecruiter.UPDATE_CV_SELECTED_STATUS + "?recruiterId=" + this.data.recruiterId + "&jobDescriptionId=" + item.jobDescriptionId + "&CVMatchingId=" + item.id, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               item.isSelected = !Boolean(item.isSelected)
            }

         })
         .catch(data => {
            this.toastr.error("Không thể cập nhật trạng thái hồ sơ.");
         }).finally(() => { this.pendingId = null; })
   }

   async openListCandidateLeft(): Promise<void> {
      if (this.isShowLeftMatched == true) return;

      await this.api.getRequest<ApiResponse<MatchingRecord[]>>(apiRecruiter.GET_CV_MATCHED_LEFT, AuthorizationMode.BEARER_TOKEN, { recruiterId: this.data.recruiterId, jobDescriptionId: this.data.jdId })
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
         width: '1080px', maxWidth: '96vw', maxHeight: '95vh',
         height: '100%',
         data: { jd: normalized, recruiterId: this.data.recruiterId }
      });

      dialogRef.closed.subscribe(() => {
         this.isHideModal = false
      });
   }

   handlePage(page: number) {
      this.pageIndex = page - 1;
      this.getPageRange();
   }

   getPageRange() {
      const start = this.pageIndex * this.pageSize;
      const content = this.data.content ?? [];
      const end = Math.min((this.pageIndex + 1) * this.pageSize, content.length);
      this.listDisplay = content.slice(start, end)
   }

   onClickRejectCv(cv: MatchingRecord) {
      if (this.pendingId !== null) return;
      this.pendingId = cv.id;
      this.api.postRequest(`${apiRecruiter.REJECT_CV}?recruiterId=${this.data.recruiterId}&jobDescriptionId=${this.data.jdId}&CVMatchingId=${cv.id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               this.toastr.success("Đã từ chối hồ sơ");
               this.data.content = (this.data.content ?? []).filter(item => item.id !== cv.id);
               this.pageIndex = Math.min(this.pageIndex, Math.max(0, Math.ceil(this.data.content.length / this.pageSize) - 1));
               this.getPageRange();
            } else {
               this.toastr.error("Không thể từ chối hồ sơ. Vui lòng thử lại.")
            }
         })
         .catch(data => {
            this.toastr.error("Không thể từ chối hồ sơ. Vui lòng thử lại.")
         }).finally(() => { this.pendingId = null; })
   }

   openConfirmDialog(jd: MatchingRecord): void {
      const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, { ariaLabelledBy: "confirm-title", ariaDescribedBy: "confirm-message",
         width: '350px',
         data: { title: 'Từ chối hồ sơ', content: 'Xác nhận từ chối hồ sơ này? Ứng viên sẽ thấy trạng thái từ chối.' }
      });

      dialogRef.closed.subscribe((result) => {
         if (result === true) {
            this.onClickRejectCv(jd);
         }
      });
   }

   private normalizeMatchingRecord(record: MatchingRecord): MatchingRecord {
      const matchingInsight = parseMatchingExplanation(record.jsonMatching);
      return {
         ...record,
         jsonMatching: matchingInsight,
         matchingInsight
      };
   }


}
