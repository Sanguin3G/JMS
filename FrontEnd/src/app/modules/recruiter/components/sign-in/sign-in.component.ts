import { Component, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, RECRUITER_TOKEN, apiRecruiter } from 'src/app/service/constant';
import { environment } from 'src/environments/environment';
import { getToken, saveItem, saveToken, setItem, signOut } from 'src/app/service/localstorage';
import { Router } from '@angular/router';
import { showError, showSuccess } from 'src/app/service/common';

@Component({
  standalone: false,
   selector: 'app-sign-in',
   templateUrl: './sign-in.component.html',
   styleUrls: ['./sign-in.component.css'],
})
export class RecruiterSignInComponent {
   backgroudSelectedLink = `${environment.Url}/assets/images/imageRecruiterRegister.png`


   username: any;
   password: any;

   constructor(private toastr: ToastrService, private router: Router) {

   }

   signIn(even: any) {
      const data = {
         username: this.username,
         password: this.password
      }
      postRequest(apiRecruiter.LOGIN_RECRUITER, AuthorizationMode.PUBLIC, data)
         .then(res => {
            if (res?.statusCode == 200) {
               signOut()
               saveToken(res.data)
               setItem(RECRUITER_TOKEN, res.data)

               postRequest(apiRecruiter.GET_PROFILE_RECRUITER, AuthorizationMode.BEARER_TOKEN, {})
                  .then(res => {

                     if (res.statusCode == 200) {

                        setTimeout(() => {
                           saveItem("profile", res.data);
                        }, 1000);

                        setTimeout(() => {
                           showSuccess(this.toastr, "Đăng nhập thành công")

                           if (res.data.companyId) {
                              this.router.navigate(['/recruiter/list-jds']);
                           } else {
                              this.router.navigate(['/recruiter/create-company']);
                           }

                        }, 1000);

                     }
                  })
                  .catch(data => {
                     console.log(apiRecruiter.GET_PROFILE_RECRUITER, data);
                  })
            }else if(res?.statusCode == 401){
               if(res.message == "Account cannot access"){
                  showError(this.toastr, "Tài khoản đã bị khóa! Liên hệ quản trị viên để biết thêm thông tin.")
               }else{
                  showError(this.toastr, "Tài khoản mật khẩu không chính xác")
               }
             } else {
               showError(this.toastr, "Tài khoản mật khẩu không chính xác")
            }
         })
         .catch(data => {
            showError(this.toastr, "Tài khoản mật khẩu không chính xác")
            console.error(apiRecruiter.LOGIN_RECRUITER, data);

         })
   }

}
