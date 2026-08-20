import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { postRequest } from 'src/app/service/api-requests';
import { showError, showSuccess } from 'src/app/service/common';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getProfile } from 'src/app/service/localstorage';

@Component({
  standalone: false,
   selector: 'candidate-change-password',
   templateUrl: './change-password.component.html',
   styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

   profile: any;

   oldPassword: string = "";
   newPassword: string = "";
   conformPassword: string = "";

   invalidOldPassword: boolean = false
   invalidNewPassword: boolean = false
   invalidConformPassword: boolean = false

   displayOldPassword: boolean = false
   displayNewPassword: boolean = false
   displayConformPassword: boolean = false

   typeOldPassword = "password"
   typeNewPassword = "password"
   typeConformPassword = "password"

   validateOldPassword(event: any) {
      this.oldPassword = event

      console.log(this.oldPassword);

      if (this.oldPassword === "" || this.oldPassword === null) this.invalidOldPassword = true
      else {
         this.invalidOldPassword = false
      }

   }

   validateNewPassword(event: any) {
      this.newPassword = event

      const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      this.invalidNewPassword = !passwordRegex.test(this.newPassword);
   }

   validateConformPassword(event: any) {
      this.conformPassword = event

      if (!(this.newPassword === this.conformPassword)) {
         this.invalidConformPassword = true
      } else {
         this.invalidConformPassword = false
      }
   }


   changeStatusOldPassword() {
      this.displayOldPassword = !this.displayOldPassword
      this.typeOldPassword = this.typeOldPassword == "password" ? "text" : "password"
   }

   changeStatusNewPassword() {
      this.displayNewPassword = !this.displayNewPassword
      this.typeNewPassword = this.typeNewPassword == "password" ? "text" : "password"
   }

   changeStatusConformPassword() {
      this.displayConformPassword = !this.displayConformPassword
      this.typeConformPassword = this.typeConformPassword == "password" ? "text" : "password"
   }

   constructor(private toastr: ToastrService) {
      this.profile = getProfile()
   }


   showInfoInput() {
      this.toastr.info('Điền các trường ở bên dưới', 'Thông báo', {
         progressBar: true,
         timeOut: 3000,
      });
   }


   validAllFiled() {
      if (!this.invalidOldPassword && !this.invalidNewPassword && !this.invalidConformPassword &&
         this.oldPassword !== "" && this.newPassword !== "" && this.conformPassword !== "" && this.validNewPassword()) {
         return true
      }
      return false
   }

   validNewPassword(){
      if(this.newPassword === this.conformPassword){
         return true
      }else{
         showError(this.toastr, "Mật khẩu mới không trùng khớp")
         return false
      }
   }


   SubmitForm() {    
      if (this.validAllFiled()) {
         postRequest(`${apiCandidate.CHANGE_PASSWORD_CANDIDATE}?candidateId=${this.profile.id}
      &oldPassword=${this.encodeText(this.oldPassword)}&newPassword=${this.encodeText(this.newPassword)}&confirmPassword=${this.encodeText(this.conformPassword)}`, AuthorizationMode.BEARER_TOKEN, {})
            .then(res => {
               console.log(res);
               if (res.statusCode == 200) {
                  showSuccess(this.toastr, "Thay đổi mật khẩu thành công")
                  this.oldPassword = ""
                  this.newPassword = ""
                  this.conformPassword = ""
               }else if (res.statusCode == 400) {
                  if (res?.message == "Old password is not correct") showError(this.toastr, "Mật khẩu cũ không chính xác")
               }else {
                  showError(this.toastr, "Đã có lỗi xảy ra, vui lòng thử lại sau")
               }
            })
            .catch(res => {
               showError(this.toastr, "Đã có lỗi xảy ra, vui lòng thử lại sau")
               console.warn(res);
            })
      } else {
         // this.showInfoInput()
      }
   }

   encodeText(text: any){
      const encode = `${encodeURIComponent(text.trim())}`;
      return encode
   }
}
