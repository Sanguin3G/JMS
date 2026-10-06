import { inject, Component } from '@angular/core';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ApiService } from 'src/app/core/http/api.service';

import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: false,
   selector: 'candidate-change-password',
   templateUrl: './change-password.component.html',
   styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);

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

   constructor(private toastr: NotificationService) {
      this.profile = this.auth.getProfile()
   }


   showInfoInput() {
      this.toastr.info('Điền các trường ở bên dưới');
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
         this.toastr.error("Mật khẩu mới không trùng khớp")
         return false
      }
   }


   SubmitForm() {
      if (this.validAllFiled()) {
         this.api.postRequest(`${apiCandidate.CHANGE_PASSWORD_CANDIDATE}?candidateId=${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, { oldPassword: this.oldPassword, newPassword: this.newPassword, confirmPassword: this.conformPassword })
            .then(res => {

               if (res.statusCode == 200) {
                  this.toastr.success("Thay đổi mật khẩu thành công")
                  this.oldPassword = ""
                  this.newPassword = ""
                  this.conformPassword = ""
               }else if (res.statusCode == 400) {
                  if (res?.message == "Old password is not correct") this.toastr.error("Mật khẩu cũ không chính xác")
               }else {
                  this.toastr.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
               }
            })
            .catch(res => {
               this.toastr.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
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
