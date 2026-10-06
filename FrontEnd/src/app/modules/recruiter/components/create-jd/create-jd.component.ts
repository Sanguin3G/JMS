import { editorConfig } from 'src/app/shared/rich-text/editor-config';
import { inject, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClassicEditor } from 'ckeditor5';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ApiService } from 'src/app/core/http/api.service';

import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: false,
   selector: 'app-create-jd',
   templateUrl: './create-jd.component.html',
   styleUrls: ['./create-jd.component.css']
})

export class CreateJdComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);
   public Editor = ClassicEditor;
   datas: any[] = [];
   categories: any;
   levels: any;
   employmentTypes: any;
   genders: any;
   profile: any;

   constructor(private toastr: NotificationService, private router: Router) {
      this.profile = this.auth.getProfile();

      this.api.getRequest(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => {
            this.categories = res.data
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_CATEGORY, data);
         })

      this.api.getRequest(apiRecruiter.GET_ALL_GENDER, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => {
            this.genders = res.data
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_GENDER, data);
         })

      this.api.getRequest(apiRecruiter.GET_ALL_LEVEL_TITLE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => {
            this.levels = res.data
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_LEVEL_TITLE, data);
         })

      this.api.getRequest(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => {
            this.employmentTypes = res.data
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, data);
         })
   }

   public configDescription = editorConfig("Job description");
   public configEducationRequirement = { ...this.configDescription, placeholder: 'Nhập yêu cầu học vấn' }
   public configExperienceRequirement = { ...this.configDescription, placeholder: 'Nhập yêu cầu kinh nghiệm' }
   public configSkillRequirement = { ...this.configDescription, placeholder: 'Nhập yêu kỹ năng' }
   public configCertificateRequirement = { ...this.configDescription, placeholder: 'Nhập yêu chứng chỉ' }
   public configProjectRequirement = { ...this.configDescription, placeholder: 'Nhập yêu cầu dự án' }
   public configBenefitRequirement = { ...this.configDescription, placeholder: 'Nhập yêu cầu quyền lợi' }
   public configOtherRequirement = { ...this.configDescription, placeholder: 'Nhập yêu cầu khác' }


   titleRq = new FormControl(null, [Validators.required]);
   numberRequiredRq = new FormControl(null, [Validators.min(1)]);
   emailRq = new FormControl(null, [Validators.email]);
   positionRq = new FormControl(null);
   levelRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   ageRequiredRq = new FormControl(null);
   genderRq = new FormControl('0');
   typeRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   categoryRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   expiredDateRq = new FormControl(this.getNextMonthFullDateString(), [Validators.required]);
   addressRq = new FormControl(null, [Validators.required]);
   salaryRq = new FormControl(null, [Validators.required, Validators.min(0)]);
   descriptionRq = new FormControl(null, [Validators.required]);
   educationRq = new FormControl(null, [Validators.required]);
   experienceRq = new FormControl(null, [Validators.required]);
   skillRq = new FormControl(null, [Validators.required]);
   certificateRq = new FormControl(null);
   projectRq = new FormControl(null);
   benefitRq = new FormControl(null, [Validators.required]);
   otherRequired = new FormControl(null);

   getErrorMessageTitle() {
      if (this.titleRq.hasError('required')) {
         return 'Tiêu đề không được để trống!'
      }
      return
   }

   getErrorMessageNumberRequired() {
      if (this.numberRequiredRq.hasError('min')) {
         return 'Số lượng tuyển dụng phải lớn hơn 0!'
      }
      return
   }

   getErrorMessageEmail() {
      if (this.emailRq.hasError('required')) {
         return 'Email không được để trống!'
      }
      if (this.emailRq.hasError('email')) {
         return 'Email không hợp lệ'
      }
      return
   }

   getErrorMessageLevel() {
      if (this.levelRq.hasError('required')) {
         return 'Cấp bậc không được để trống!'
      }
      if (this.levelRq.hasError('min')) {
         return 'Cấp bậc không được để trống!'
      }
      return
   }


   getErrorMessageGender() {
      if (this.genderRq.hasError('required')) {
         return 'Giới tính không được để trống!'
      }
      if (this.genderRq.hasError('min')) {
         return 'Giới tính không được để trống!'
      }
      return
   }

   getErrorMessageType() {
      if (this.typeRq.hasError('required')) {
         return 'Loại việc làm không được để trống!'
      }
      if (this.typeRq.hasError('min')) {
         return 'Loại việc làm không được để trống!'
      }
      return
   }

   getErrorMessageCategory() {
      if (this.categoryRq.hasError('required')) {
         return 'Lĩnh vực không được để trống!'
      }
      if (this.categoryRq.hasError('min')) {
         return 'Lĩnh vực không được để trống!'
      }
      return
   }

   getErrorMessageExpiredDateRq() {
      if (this.expiredDateRq.hasError('required')) {
         return 'Ngày hết hạn không được để trống!'
      }
      return
   }

   getErrorMessageAddress() {
      if (this.addressRq.hasError('required')) {
         return 'Địa chỉ không được để trống!'
      }
      return
   }

   getErrorMessageMinSalary() {
      if (this.salaryRq.hasError('required')) {
         return 'Mức lương không được để trống!'
      }
      if (this.salaryRq.hasError('min')) {
         return 'Mức lương phải lớn hơn 0!'
      }
      return
   }


   getErrorMessageDescription() {
      if (this.descriptionRq.hasError('required')) {
         return 'Mô tả công việc không được để trống!'
      }
      return
   }

   getErrorMessageExperienceRequirement() {
      if (this.experienceRq.hasError('required')) {
         return 'Yêu cầu kinh nghiệm không được để trống!'
      }
      return
   }

   getErrorMessageSkillRequirement() {
      if (this.skillRq.hasError('required')) {
         return 'Yêu cầu kỹ năng không được để trống!'
      }
      return
   }

   checkReq: any = false;
   checkDes: any = false;
   checkBen: any = false;

   submitting = false;

   submitButtonClicked() {
      if (this.submitting) return;
      if (this.titleRq.valid && this.emailRq.valid && this.addressRq.valid && this.salaryRq.valid && this.descriptionRq.valid && this.educationRq.valid && this.experienceRq.valid && this.skillRq.valid && this.benefitRq.valid && this.numberRequiredRq.valid && this.categoryRq.valid && this.levelRq.valid && this.typeRq.valid && this.expiredDateRq.valid) {

         const title = this.titleRq.value;
         const numberRequirement = this.numberRequiredRq.value;
         const contactEmail = this.emailRq.value;
         const positionTitle = this.positionRq.value;
         const levelTitle = this.levelRq.value === '0' ? null :  this.levelRq.value;
         const ageRequirement = this.ageRequiredRq.value;
         const genderRequirement = this.genderRq.value === '0' ? "3" :  this.genderRq.value;
         const employmentTypeName = this.typeRq.value === '0' ? null :  this.typeRq.value;
         const categoryName = this.categoryRq.value === '0' ? null :  this.categoryRq.value;
         const expiredDate = this.expiredDateRq.value;
         const address = this.addressRq.value;
         const salary = this.salaryRq.value;
         const jobDetail = this.descriptionRq.value;
         const educationRequirement = this.educationRq.value;
         const experienceRequirement = this.experienceRq.value;
         const skillRequirement = this.skillRq.value;
         const certificateRequirement = this.certificateRq.value;
         const projectRequirement = this.projectRq.value;
         const candidateBenefit = this.benefitRq.value;
         const otherInformation = this.otherRequired.value;

         const data = {
            title: title,
            employmentTypeName: employmentTypeName,
            genderRequirement: genderRequirement,
            ageRequirement: ageRequirement,
            educationRequirement: educationRequirement,
            jobDetail: jobDetail,
            experienceRequirement: experienceRequirement,
            projectRequirement: projectRequirement,
            skillRequirement: skillRequirement,
            certificateRequirement: certificateRequirement,
            otherInformation: otherInformation,
            candidateBenefit: candidateBenefit,
            salary: salary,
            contactEmail: contactEmail,
            address: address,
            numberRequirement: numberRequirement,
            companyName: this.profile.companyId.toString(),
            categoryName: categoryName,
            expiredDate: expiredDate,
            levelTitle: levelTitle,
            positionTitle: positionTitle,
            companyDTO: {
               "companyId": this.profile.companyId,
               "companyName": "string",
               "email": "string",
               "phone": "string"
            },
         }

         this.submitting = true;
         this.api.postRequest(`${apiRecruiter.POST_CREATE_JD}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, data)
            .then(res => {
               if(res.statusCode == 201){
                  this.toastr.success("Tạo bài viết thành công")
                  setTimeout(() => this.router.navigate(['/recruiter/list-jds']), 1000);
               }else{
                  this.toastr.error("Tạo bài viết thất bại")
               }

            })
            .catch(data => {
               this.toastr.error("Tạo bài viết thất bại")
            }).finally(() => { this.submitting = false; })


         return
      }

      this.checkReq = true;
      this.checkDes = true;
      this.checkBen = true;
      this.titleRq.markAllAsTouched();
      this.numberRequiredRq.markAllAsTouched();
      this.positionRq.markAllAsTouched();
      this.levelRq.markAllAsTouched();
      this.genderRq.markAllAsTouched();
      this.typeRq.markAllAsTouched();
      this.categoryRq.markAllAsTouched();
      this.expiredDateRq.markAllAsTouched();
      this.addressRq.markAllAsTouched();
      this.salaryRq.markAllAsTouched();
      this.descriptionRq.markAllAsTouched();
      this.experienceRq.markAllAsTouched();
      this.skillRq.markAllAsTouched();
      this.benefitRq.markAllAsTouched();
      this.toastr.info("Vui lòng nhập đủ thông tin yêu cầu!")
      return
   }

   getNextMonthFullDateString(): string {
      const date = new Date(); date.setDate(date.getDate() + 30);
      return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
   }
}
