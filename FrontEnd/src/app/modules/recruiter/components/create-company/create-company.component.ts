import { Component } from '@angular/core';
import { ClassicEditor } from 'ckeditor5';
import { FormControl, Validators } from '@angular/forms';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, RECRUITER_TOKEN, apiRecruiter } from 'src/app/service/constant';
import { getItem, getProfile, isLogin, saveItem, signOut } from 'src/app/service/localstorage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { showError, showSuccess } from 'src/app/service/common';

@Component({
  standalone: false,
   selector: 'app-company-register',
   templateUrl: './create-company.component.html',
   styleUrls: ['./create-company.component.css']
})
export class CreateCompanyComponent {
   //upload img
   displayImage = "none"
   fileSrc: any;
   public Editor = ClassicEditor;
   categories: any;


   constructor(private router: Router, private toastr: ToastrService) {
      getRequest(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => {
            this.categories = res?.data
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_CATEGORY, data);
         })
   }

   nameRq = new FormControl('', [Validators.required]);
   emailRq = new FormControl('', [Validators.required, Validators.email]);
   taxNumRq = new FormControl('', [Validators.required]);
   websiteRq = new FormControl('');
   categoryRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   sizeRq = new FormControl('0', [Validators.required, Validators.min(1)]);
   addressRq = new FormControl('', [Validators.required]);
   yearOfEstablishmentRq = new FormControl('');
   phoneRq = new FormControl('', [Validators.required, Validators.pattern(/^\d{9,10}$/)]);
   descriptionRq = new FormControl('', [Validators.required]);

   getErrorMessageName() {
      if (this.nameRq.hasError('required')) {
         return 'Tên công ty không được để trống!'
      }
      return
   }
   getErrorMessageEmail() {
      if (this.emailRq.hasError('required')) {
         return 'Email không được để trống!'
      }
      if (this.emailRq.hasError('email')) {
         return 'Email không hợp lệ!'
      }
      return
   }
   getErrorMessageTaxNum() {
      if (this.taxNumRq.hasError('required')) {
         return 'Mã số thuế không được để trống!'
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
   getErrorMessageSize() {
      if (this.sizeRq.hasError('required')) {
         return 'Quy mô không được để trống!'
      }
      if (this.sizeRq.hasError('min')) {
         return 'Quy mô không được để trống!'
      }
      return
   }
   getErrorMessageAddress() {
      if (this.addressRq.hasError('required')) {
         return 'Địa chỉ không được để trống!'
      }
      return
   }

   getErrorMessagePhone() {
      if (this.phoneRq.hasError('required')) {
         return 'Số điện thoại không được để trống!'
      }
      if (this.phoneRq.hasError('pattern')){
         return 'Số điện thoại không hợp lệ!'
      }
      return
   }

   getErrorMessageDescriptionRequirement() {
      if (this.descriptionRq.hasError('required')) {
         return 'Mô tả không được để trống!'
      }
      return
   }

   checkReq: any = false;

   submitButtonClicked() {

      if (this.nameRq.valid && this.emailRq.valid && this.taxNumRq.valid
         && this.sizeRq.valid && this.addressRq.valid
         && this.phoneRq.valid && this.descriptionRq.valid) {
         const companyName = this.nameRq.value;
         const email = this.emailRq.value;
         const phone = this.phoneRq.value;
         const address = this.addressRq.value;
         const description = this.descriptionRq.value;
         const tax = this.taxNumRq.value?.toString();
         const webURL = this.websiteRq.value;
         const categoryName = null;
         const size = this.sizeRq.value;
         const yearOfEstablishment = this.yearOfEstablishmentRq.value === "" ? null : this.yearOfEstablishmentRq.value;

         const profile = getProfile();

         const data = {
            companyName: companyName,
            email: email,
            phone: phone,
            address: address,
            description: description,
            webURL: webURL,
            tax: tax,
            categoryName: categoryName,
            size: size,
            recuirterFounder: profile.id.toString(),
            recuirtersInCompany: [],
            jDs: [],
            yearOfEstablishment: yearOfEstablishment
         }

         postRequest(apiRecruiter.CREATE_COMPANY_BY_ID + "/" + profile.id, AuthorizationMode.BEARER_TOKEN, data)
            .then(res => {
               if (res.statusCode === 201) {
                  showSuccess(this.toastr, "Đăng ký công ty thành công")
                  this.updateAccount();
               } else {
                  showError(this.toastr, "Tạo công ty thất bại, vui lòng thử lại")
               }
            })
            .catch(data => {
               showError(this.toastr, "Tạo công ty thất bại, vui lòng thử lại")
            })
      }

      this.checkReq = true;
      this.nameRq.markAllAsTouched()
      this.emailRq.markAllAsTouched()
      this.taxNumRq.markAllAsTouched()
      this.categoryRq.markAllAsTouched()
      this.sizeRq.markAllAsTouched()
      this.addressRq.markAllAsTouched()
      this.phoneRq.markAllAsTouched()
      this.descriptionRq.markAllAsTouched()

      return
   }

   getFile(event: any) {
      if (event.target.files && event.target.files[0]) {
         this.displayImage = "block"

         var reader = new FileReader();

         reader.readAsDataURL(event.target.files[0]);

         reader.onload = (event) => {
            this.fileSrc = event.target?.result;
         }
      }
   }

   updateAccount() {
      postRequest(apiRecruiter.GET_PROFILE_RECRUITER, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               setTimeout(() => {
                  saveItem("profile", res.data);
               }, 1000);

               setTimeout(() => {
                  if (res.data.companyId) {
                     this.router.navigate(['/recruiter/list-jds']);
                  } else {
                     this.router.navigate(['/recruiter/create-company']);
                  }

               }, 1000);

            }
         })
         .catch(data => {
            console.log(data);
         })
   }
}
