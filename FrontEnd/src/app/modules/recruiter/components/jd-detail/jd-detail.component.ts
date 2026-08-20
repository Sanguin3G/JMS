import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListCandidateComponent } from '../list-candidate/list-candidate.component';
import { ApiResponse, getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { ActivatedRoute } from '@angular/router';
import { OptionMatchModalComponent } from '../option-match-modal/option-match-modal.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ViewportScroller } from '@angular/common';
import { getProfile } from 'src/app/service/localstorage';
import { showError, showInfo, showSuccess, showSuccessWithTime } from 'src/app/service/common';
import { JobDetail, MatchingRecord, RecruiterCandidateDialogData, UserProfile } from 'src/app/core/models/api.models';

@Component({
  standalone: false,
   selector: 'app-jd-detail',
   templateUrl: './jd-detail.component.html',
   styleUrls: ['./jd-detail.component.css']
})
export class JdDetailComponent {
   jdDetail: JobDetail | null = null
   id: string | null = null
   listCandidate: MatchingRecord[] = []
   jobDescription: any
   jobBenefit: any
   jobRequirement: any
   matchOption: any
   descriptionJd: any
   jobRequirementJd: any
   skillRequirementJd: any
   experienceRequirementJd: any
   educationRequirementJd: any
   candidateBenefitJd: any
   isMatching: boolean = false;
   Url = environment.Url;
   profile: UserProfile | null

   constructor(public dialog: MatDialog, private route: ActivatedRoute, private toastr: ToastrService, private viewportScroller: ViewportScroller) {
      this.route.params.subscribe(params => {
         this.id = params['id'];
      });
      this.profile = getProfile()

      this.viewportScroller.scrollToPosition([0, 0]);

      //get jd detail
      getRequest<ApiResponse<JobDetail>>(apiRecruiter.GET_JD_BY_RECRUITER + "/" + this.profile?.id + "/" + this.id, AuthorizationMode.BEARER_TOKEN, { jdId: this.id })
         .then(res => {
            this.jdDetail = res.data ?? null
            this.handleData();
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, data);
         })
   }

   openMatchingDialog(): void {
      const dialogRef = this.dialog.open(OptionMatchModalComponent, {
         width: '40%'
      });

      dialogRef.afterClosed().subscribe(result => {
         if (result !== undefined) {
            this.matchOption = result;
            console.log(this.matchOption);
            this.isMatching = true;
            showSuccess(this.toastr, "Xác nhận thành công <br/> Hệ thống đang tìm ứng viên phù hợp");
            // call matching api
            if (!this.jdDetail) return;
            postRequest<ApiResponse<MatchingRecord[]>>(apiRecruiter.MATCHING_JOB + "?recruiterId=" + this.jdDetail.recuirterId + "&jobDescriptionId=" + this.jdDetail.jobId, AuthorizationMode.BEARER_TOKEN, {})
               .then(res => {
                  if (res.statusCode == 200) {
                     this.isMatching = false;
                     showSuccessWithTime(this.toastr, "Đề xuất thành công <br/>Đã tìm thấy " + (res.data?.length ?? 0) + " ứng viên. Vui lòng xem chi tiết tại danh sách đề xuất", 3000);
                  } else if(res.statusCode == 500){
                     this.isMatching = false;
                     showError(this.toastr, "Đề xuất thất bại <br/> GPT AI hiện tại đang có vấn đề. Vui lòng thử lại sau");
                  } 
                  else {
                     showError(this.toastr, "Đề xuất thất bại <br/> Vui lòng thử lại sau")
                  }
                  console.log(res);
               })
               .catch(data => {
                  showError(this.toastr, "Đề xuất thất bại <br/> Vui lòng thử lại sau")
                  console.log(data);
               })
         }
      });
   }

   async openCandidateDialog(type: number): Promise<void> {
      // type 0: matched list 
      // type 1: matched list left
      // type 2: selected list
      const typeCandidate = type == 0 ? apiRecruiter.GET_CV_MATCHED : type == 1 ? apiRecruiter.GET_CV_MATCHED_LEFT : apiRecruiter.GET_CV_SELECTED
      if (!this.jdDetail?.recuirterId) return;
      await getRequest<ApiResponse<MatchingRecord[]>>(typeCandidate, AuthorizationMode.BEARER_TOKEN, { recruiterId: this.jdDetail.recuirterId, jobDescriptionId: this.jdDetail.jobId, pageIndex: 1 })
         .then(async res => {
            this.listCandidate = res.data ?? []
            const dialogData: RecruiterCandidateDialogData = {
               listType: type,
               recruiterId: this.jdDetail?.recuirterId ?? 0,
               jdId: this.jdDetail?.jobId ?? 0,
               content: this.listCandidate
            };
            this.dialog.open(ListCandidateComponent, {
               width: '60%',
               data: dialogData
            });
         })
         .catch(data => {
            console.warn(data);
         })
   }

   handleData() {
      if (!this.jdDetail) return;
      this.descriptionJd = this.handleText(this.jdDetail.jobDetail);
      this.candidateBenefitJd = this.handleText(this.jdDetail.candidateBenefit);
      this.skillRequirementJd = this.handleText(this.jdDetail.skillRequirement);
      this.experienceRequirementJd = this.handleText(this.jdDetail.experienceRequirement);
      this.educationRequirementJd = this.handleText(this.jdDetail.educationRequirement);
      // this.jobRequirementJd = this.handleText(skillRq) + '\n' + this.handleText(expRq) + '\n' + this.handleText(eduRq)
   }

   handleText(text: string | undefined) {
      const lines: string[] = (text ?? '').trim().split('\n');
      const linesWithHyphen: string[] = lines.map((line: string) => (line.startsWith('-') ? line : `${line}`));
      const newText: string = linesWithHyphen.join('\n');
      return newText
   }
}
