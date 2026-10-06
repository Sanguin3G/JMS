import { inject, Component } from '@angular/core';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ApiService } from 'src/app/core/http/api.service';

import { ADMIN_PROFILE, AuthorizationMode, apiAdmin, apiRecruiter } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);
  profile: any
  company: any
  newProfile: any = { fullname: '', phone: '', dob: '', gender: '', desc: null }
  dobb: any

  constructor(public toastr: NotificationService) {
    this.profile = this.auth.getProfile()
    this.dobb = this.profile?.dob.slice(0, 10)

  }

  changePassword(oldPass: HTMLInputElement, newPass: HTMLInputElement, rePass: HTMLInputElement) {

    if (this.isOldPassValid(oldPass.value) && this.isPasswordValid(newPass.value) && this.isRePassMatch(newPass.value, rePass.value)) {
      this.api.postRequest(apiAdmin.CHANGE_PASSWORD + "?adminId=" + this.profile.id, AuthorizationMode.BEARER_TOKEN, { oldPassword: oldPass.value, newPassword: newPass.value, confirmPassword: rePass.value })
        .then(res => {

          if (res.statusCode == 200) {
            this.toastr.success("Thay đổi mật khẩu thành công!")
          } else {
            if(res.message === "Password have to have number of characters >= 8 and <= 20"){
              this.toastr.error("Độ dài mật khẩu không hợp lệ!")
            }else if(res.message === "Old password is not correct"){
              this.toastr.error("Mật khẩu cũ không đúng!")
            }else if(res.message === "Password and confirmPassword are not matching"){
              this.toastr.error("Mật khẩu mới không khớp. Vui lòng kiểm tra lại!")
            }else{
              this.toastr.error("Đổi mật khẩu thất bại, vui lòng thử lại sau!")
            }
          }
        })
        .catch(data => {

          this.toastr.error("Thay đổi thất bại! Vui lòng thử lại sau.")
        })
    }
  }

  isOldPassValid(oldPass:any){
    if (oldPass.trim().length == 0) {
      this.toastr.error("Hãy nhập mật khẩu!")
      return false;
    }
    return true;
  }

  isPasswordValid(password: string): boolean {
    if (password.trim().length == 0) {
      this.toastr.error("Hãy nhập mật khẩu mới!")
      return false
    }

    if (password.length < 8 || password.length > 20) {
      this.toastr.error("Độ dài mật khẩu không hợp lệ!")
      return false;
    }

    if (password.includes(' ')) {
      this.toastr.error("Mật khẩu chứa khoảng trắng!")
      return false;
    }

    return true;
  }

  isRePassMatch(newPass: any, rePass: any) {
    if (rePass.trim().length == 0) {
      this.toastr.error("Hãy xác nhận mật khẩu!")
      return false
    }

    if (newPass !== rePass) {
      this.toastr.error("Mật khẩu xác nhận không trùng khớp!")
      return false
    }

    return true
  }

  convertDate(jsonDateString: string): string {
    const dateObject = new Date(jsonDateString);

    // Lấy ngày, tháng, năm
    const day = dateObject.getDate();
    const month = dateObject.getMonth() + 1; // Tháng bắt đầu từ 0, cần cộng thêm 1
    const year = dateObject.getFullYear();

    // Tạo chuỗi ngày tháng năm
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;

    return formattedDate;
  }
}
