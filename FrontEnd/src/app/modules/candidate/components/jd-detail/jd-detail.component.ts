import { Component, ViewEncapsulation } from '@angular/core';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getProfile, signOut } from 'src/app/service/localstorage';
import { showError, showInfo, showSuccess } from 'src/app/service/common';
@Component({
  standalone: false,
   selector: 'app-jd-detail',
   templateUrl: './jd-detail.component.html',
   styleUrls: ['./jd-detail.component.css'],
   encapsulation: ViewEncapsulation.None
})

export class JdDetailComponent {

   jd: any;
   listCvs: any;
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
   JDId: any;
   profile: any
   selectedCV = "0"
   isLogin = false
   pending = false

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
      let id: any;
      this.route.params.subscribe(params => {
         id = params['id'];
      });

      getRequest(apiCandidate.GET_JD_BY_ID, AuthorizationMode.BEARER_TOKEN, { jdId: id })
         .then(res => {
            this.jd = res?.data;
            console.log(this.jd);

            this.JDId = this.jd.jobId
            this.jobDetail = this.jd?.jobDetail
            this.educationRequirement = this.jd?.educationRequirement
            this.experienceRequirement = this.jd?.experienceRequirement
            this.skillRequirement = this.jd?.skillRequirement
            this.certificateRequirement = this.jd?.certificateRequirement
            this.projectRequirement = this.jd?.projectRequirement
            this.candidateBenefit = this.jd?.candidateBenefit
            this.otherInformation = this.jd?.otherInformation
            this.descriptionCompany = this.jd?.companyDTO?.description

            const currentDate = new Date()
            const expiredDate = this.convertStringDateInput(this.jd?.expiredDate)
            if (expiredDate < currentDate) {
               this.isExpiredDate = true
            }
         })
         .catch(error => {
         })

         if(this.isLogin){
            getRequest(`${apiCandidate.GET_ALL_CV_BY_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               this.listCvs = res?.data;
               console.log(this.listCvs);
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


   submitCv(event: any) {
      if (this.validateSubmitCv()) {
         this.pending = true
         postRequest(`${apiCandidate.CANDIDATE_APPLYJOB}?candidateId=${this.profile.id}&CVid=${this.selectedCV}&jobDescriptionId=${this.JDId}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               if (res?.statusCode == 200) {
                  showSuccess(this.toastr, "Nhà tuyển dụng sẽ duyệt hồ sơ của bạn")
                  console.log(res);
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
