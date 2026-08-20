import { Component, ViewEncapsulation } from '@angular/core';
import { ApiResponse, getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getProfile, signOut } from 'src/app/service/localstorage';
import { showError, showInfo, showSuccess } from 'src/app/service/common';
import { CurriculumVitae, JobDetail, UserProfile } from 'src/app/core/models/api.models';
@Component({
  standalone: false,
   selector: 'app-jd-detail',
   templateUrl: './jd-detail.component.html',
   styleUrls: ['./jd-detail.component.css'],
   encapsulation: ViewEncapsulation.None
})

export class JdDetailComponent {

   jd: JobDetail | null = null;
   listCvs: CurriculumVitae[] = [];
   jobDetail = "";
   educationRequirement = "";
   experienceRequirement = "";
   skillRequirement = "";
   certificateRequirement = "";
   projectRequirement = "";
   candidateBenefit = "";
   otherInformation = "";
   descriptionCompany = "";
   listJds: any;
   isExpiredDate = false
   JDId: number | null = null;
   profile: UserProfile | null
   selectedCV = "0"
   isLogin = false
   pending = false
   isApplyModalOpen = false

   convertStringDateInput(str: string) {
      const dateStr: string = str;
      const item = dateStr.split("/")
      const newDateString = item[1] + "-" + item[0] + "-" + item[2]
      const originalDate: Date = new Date(newDateString);
      return originalDate
   }

   constructor(private route: ActivatedRoute, private toastr: ToastrService, private router: Router) {
      this.profile = getProfile();
      this.isLogin = this.profile !== null
      let id: string | null = null;
      this.route.params.subscribe(params => {
         id = params['id'];
      });

      getRequest<ApiResponse<JobDetail>>(apiCandidate.GET_JD_BY_ID, AuthorizationMode.BEARER_TOKEN, { jdId: id })
         .then(res => {
            this.jd = res.data ?? null;

            this.JDId = this.jd?.jobId ?? null
            this.jobDetail = this.jd?.jobDetail ?? ''
            this.educationRequirement = this.jd?.educationRequirement ?? ''
            this.experienceRequirement = this.jd?.experienceRequirement ?? ''
            this.skillRequirement = this.jd?.skillRequirement ?? ''
            this.certificateRequirement = this.jd?.certificateRequirement ?? ''
            this.projectRequirement = this.jd?.projectRequirement ?? ''
            this.candidateBenefit = this.jd?.candidateBenefit ?? ''
            this.otherInformation = this.jd?.otherInformation ?? ''
            this.descriptionCompany = this.jd?.companyDTO?.description ?? ''

            const currentDate = new Date()
            const expiredDate = this.jd?.expiredDate ? this.convertStringDateInput(this.jd.expiredDate) : null;
            this.isExpiredDate = expiredDate ? expiredDate < currentDate : false;
         })
         .catch(error => {
         })

         if(this.profile){
            const candidateId = this.profile.id;
            getRequest<ApiResponse<CurriculumVitae[]>>(`${apiCandidate.GET_ALL_CV_BY_ID}/${candidateId}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               this.listCvs = res.data ?? [];
            })
            .catch(data => {
            })
         }
   }

   validateSubmitCv() {
      if (this.selectedCV == "0") {
         showInfo(this.toastr, "Vui lòng chọn hồ sơ ứng tuyển")
         return false
      }
      return true
   }

   openApplyModal() {
      if (this.isLogin && !this.isExpiredDate) this.isApplyModalOpen = true;
   }

   closeApplyModal() {
      if (!this.pending) this.isApplyModalOpen = false;
   }


   submitCv(event: any) {
      if (this.validateSubmitCv() && this.profile && this.JDId) {
         this.pending = true
         postRequest(`${apiCandidate.CANDIDATE_APPLYJOB}?candidateId=${this.profile.id}&CVid=${this.selectedCV}&jobDescriptionId=${this.JDId}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               if (res?.statusCode == 200) {
                  showSuccess(this.toastr, "Nhà tuyển dụng sẽ duyệt hồ sơ của bạn")
                  console.log(res);
                  this.isApplyModalOpen = false
                  this.pending = false
               }
               if (res?.statusCode == 204) {
                  showError(this.toastr, "Hồ sơ của bạn đã ứng tuyển")
                  console.log(res);
                  this.pending = false
               }
               if (res?.statusCode == 400) {
                  showError(this.toastr, "Ứng tuyển thất bại vui lòng thứ lại sau")
                  console.log(res);
                  this.pending = false
               }
            })
            .catch(data => {
               showError(this.toastr, "Ứng tuyển thất bại vui lòng thứ lại sau")
               console.log(data);
               this.pending = false
            })
      }
   }
}
