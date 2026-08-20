import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { postFileRequest, postRequest } from 'src/app/service/api-requests';
import { showError, showInfo, showSuccess } from 'src/app/service/common';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getToken, saveItem } from 'src/app/service/localstorage';

@Component({
  standalone: false,
   selector: 'app-candidate-profile',
   templateUrl: './profile.component.html',
   styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
   profile: any

   FullName: any
   Phone: any
   Dob: any
   Male: boolean = true
   Female: any
   genderId = '1';


   invalidFullName: boolean = false;
   invalidPhone: boolean = false;
   invalidDob: boolean = false;

   validateFullName(event: any) {
      this.FullName = event

      const vietnameseNameRegex: RegExp = /^[\p{L} ]+$/u;
      this.invalidFullName = !vietnameseNameRegex.test(this.FullName);
   }

   validatePhone(event: any) {
      this.Phone = event

      const PhoneRegex: RegExp = /^\d{10}$/;
      this.invalidPhone = !PhoneRegex.test(this.Phone);
   }

   validateDob(event: any) {
      this.Dob = event

      const DobRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/
      this.invalidDob = !DobRegex.test(this.Dob);
   }

   validAllFiled() {
      if (!this.invalidFullName && !this.invalidPhone && !this.invalidDob &&
         this.FullName !== "" && this.Phone !== "" && this.Dob !== "") {
         return true
      }
      return false
   }

   getProfile = () => {
      var token = getToken()

      postRequest(apiCandidate.GET_PROFILE_USER + "?token=" + token, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               this.profile = res.data

               this.FullName = this.profile.fullName
               this.Dob = this.profile.dob.split('T')[0]
               this.Phone = this.profile.phoneNumber
               this.genderId = this.profile.isMale ? '1' : '2';

               saveItem("profile", res.data);
            }
         })
         .catch(error => {
         })
   }

   constructor(private toastr: ToastrService, private router: Router) {
      this.getProfile()
   }

   getFile(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {

         let formData: FormData = new FormData();
         formData.append('file', file, file.name);

         postFileRequest(`${apiCandidate.UPDATE_AVATAR_CANDIDATE}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, formData)
            .then(res => {
               if (res.statusCode == 200) {
                  showSuccess(this.toastr, "Chỉnh sửa ảnh thành công")
                  this.getProfile()
               }
            })
            .catch(data => {
               showError(this.toastr, "Chỉnh sửa ảnh thất bại")
               console.log(data);
            })
      }
   }

   SubmitForm() {
      if (this.validAllFiled()) {
         const parameters = new URLSearchParams({
            candidateId: this.profile.id.toString(),
            fullName: this.FullName,
            phone: this.Phone,
            DOB: this.Dob,
            genderId: this.genderId
         });

         postRequest(`${apiCandidate.UPDATE_PROFILE_CANDIDATE}?${parameters.toString()}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               if (res.statusCode == 200) {
                  showSuccess(this.toastr, "Chỉnh sửa thông tin cá nhân thành công")
                  this.getProfile()
               }
               if (res.statusCode == 400) {
                  showError(this.toastr, "Chỉnh sửa thông tin cá nhân thất bại")
               }
            })
            .catch(res => {
               showError(this.toastr, "Chỉnh sửa thông tin cá nhân thất bại")
               console.warn(res);

            })
      } else {
         showInfo(this.toastr, "Điền các trường ở bên dưới")
      }
   }
}
