import { Component, ViewEncapsulation } from '@angular/core';
import { postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, CANDIDATE_TOKEN, apiCandidate } from 'src/app/service/constant';
import { ToastrService } from 'ngx-toastr';
import { saveToken, saveItem, setItem } from 'src/app/service/localstorage';
import { Router } from '@angular/router';
import { showError, showSuccess } from 'src/app/service/common';

declare var $: any;
@Component({
  standalone: false,
   selector: 'app-sign-in',
   templateUrl: './sign-in.component.html',
   styleUrls: ['./sign-in.component.css'],
})


export class CandidateSignInComponent {
   username: any;
   password: any;

   constructor(private toastr: ToastrService, private router: Router) {
   }

   signIn(even: any) {
      this.loginAccount()
   }

   loginAccount() {
      const data = {
         username: this.username,
         password: this.password
      }

      postRequest(apiCandidate.LOGIN_CANDIDATE, AuthorizationMode.PUBLIC, data)
         .then(res => {
            if (res?.statusCode == 200) {
               saveToken(res.data)
               setItem(CANDIDATE_TOKEN, res.data)

               this.getProfileUser(res?.data)

            }else if(res?.statusCode == 401){
               if(res.message == "Account cannot access"){
                  showError(this.toastr, "Tài khoản đã bị khóa! Liên hệ quản trị viên để biết thêm thông tin.")
               }
            } else {
               showError(this.toastr, "Tài khoản hoặc mật khẩu không chính xác")
            }
         })
         .catch(data => {
            showError(this.toastr, "Tài khoản hoặc mật khẩu không chính xác")
            console.error(apiCandidate.LOGIN_CANDIDATE);
         })
   }

   getProfileUser(token: string) {
      postRequest(apiCandidate.GET_PROFILE_USER + "?token=" + token, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {

               setTimeout(() => {
                  saveItem("profile", res.data);
               }, 1000);

               setTimeout(() => {
                  showSuccess(this.toastr, "Đăng nhập thành công")
                  this.router.navigate(['/candidate/']);
               }, 1000);
            }
         })
         .catch(data => {
            showError(this.toastr, "Token Không hợp lệ")
            console.error(apiCandidate.GET_PROFILE_USER);
         })
   }

}
