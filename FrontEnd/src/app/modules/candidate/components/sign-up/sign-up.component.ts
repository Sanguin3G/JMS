import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { postRequest } from 'src/app/service/api-requests';
import { showError, showInfo, showSuccess } from 'src/app/service/common';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';

@Component({
  standalone: false,
   selector: 'app-register',
   templateUrl: './sign-up.component.html',
   styleUrls: ['./sign-up.component.css'],
})
export class CandidateRegisterComponent {

   FullName = ""
   UserName = ""
   Email = ""
   Password = ""
   rePassword = ""

   invalidFullName: boolean = false;
   invalidUserName: boolean = false;
   invalidEmail: boolean = false;
   invalidPassword: boolean = false;
   invalidRePassword: boolean = false;
   checkbox: boolean = false;

   validateFullName(event: any) {
      this.FullName = event

      const vietnameseNameRegex: RegExp = /^[\p{L} ]+$/u;
      this.invalidFullName = !vietnameseNameRegex.test(this.FullName);
   }

   validateUserName(event: any) {
      this.UserName = event

      const usernameRegex: RegExp = /^[^\s]{6,}$/;
      this.invalidUserName = !usernameRegex.test(this.UserName);
   }

   validateEmail(event: any) {
      this.Email = event

      const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.invalidEmail = !emailRegex.test(this.Email);
   }

   validatePassword(event: any) {
      this.Password = event

      const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      this.invalidPassword = !passwordRegex.test(this.Password);
   }

   validateRePassword(event: any) {
      this.rePassword = event

      if (!(this.Password === this.rePassword)) {
         this.invalidRePassword = true
      } else {
         this.invalidRePassword = false
      }
   }

   ChangeStatusCheckbox(event: any){
      this.checkbox = ! this.checkbox 
   }


   constructor(private toastr: ToastrService, private router: Router) {

   }

   validAllFiled() {
      if (!this.invalidFullName && !this.invalidUserName && !this.invalidEmail
         && !this.invalidPassword && !this.invalidRePassword &&
         this.Email !== "" && this.FullName !== "" && this.UserName !== ""
         && this.Password !== "" && this.rePassword !== "") {
         return true
      }else{
   

         return false
      }
   }

   Submit() {
      if (this.validAllFiled()) {
         if(!this.checkbox){
            showInfo(this.toastr, "Hãy chấp nhận điều khoản của chúng tôi")
            return
         } 

         postRequest(`${apiCandidate.REGISTER_ACCOUNT_CANDIDATE}?email=${this.Email}
         &fullName=${this.FullName}&username=${this.UserName}&password=${this.Password}&confirmPassword=${this.rePassword}`, AuthorizationMode.PUBLIC, {})
            .then(res => {
               if (res.statusCode == 200 && res.message === 'Register successful') {
                  showSuccess(this.toastr, "Đăng ký tài khoản thành công")
                  this.router.navigate(['/candidate/sign-in']);
               } else if(res.message === 'Email exist in system'){
                  showError(this.toastr, "Địa chỉ email đã được sử dụng!")
               } else if(res.message === 'Username exist in system'){
                  showError(this.toastr, "Tài khoản đã được sử dụng!")
               }else{
                  showError(this.toastr, "Đăng ký tài khoản thất bại, vui lòng thử lại sau")
               }
            })
            .catch(res => {
               showError(this.toastr, "Đăng ký tài khoản thất bại, vui lòng thử lại sau")
               console.warn(res);
            })
      }
      else {
         showInfo(this.toastr, "Điền các trường ở bên dưới")
      }
   }
}
