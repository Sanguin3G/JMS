import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { postRequest } from 'src/app/service/api-requests';
import { showError, showSuccess } from 'src/app/service/common';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';

@Component({
  standalone: false,
   selector: 'app-forgot-password',
   templateUrl: './forgot-password.component.html',
   styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
   isSend: any
   constructor(private toastr: ToastrService) {
      this.isSend = true
   }

   getPassword(email: HTMLInputElement) {
      if (this.isValidEmail(email.value)) {
         this.isSend = false
         postRequest(`${apiRecruiter.FORGOT_PASSWORD_RECRUITER}?email=${email.value}`, AuthorizationMode.PUBLIC, { Email: email.value })
         .then(res => {
            if(res?.statusCode == 200){
               showSuccess(this.toastr, "Tạo mật khẩu mới thành công, vui lòng kiểm tra Email")
               this.isSend = true
            } else if(res?.data == "email does not exist! Check again"){
               showError(this.toastr, "Email không tồn tại, vui lòng kiểm tra lại!")
               this.isSend = true
               return
            }
            this.isSend = true
            console.log(res);
         })
         .catch(res => {
            this.isSend = true
            showError(this.toastr, "Thay đổi mật khẩu thất bại, vui lòng thử lại sau")
         })
      } else {
         showError(this.toastr, "Vui lòng nhập email hợp lệ!")
      }

   }

   isValidEmail(email: string): boolean {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
   }
}
