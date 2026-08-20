import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { showError, showSuccess } from 'src/app/service/common';
import { ADMIN_PROFILE, AuthorizationMode, apiAdmin, apiRecruiter } from 'src/app/service/constant';
import { getItem, getItemJson, getProfile, saveItem } from 'src/app/service/localstorage';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  profile: any
  company: any
  newProfile: any = { fullname: '', phone: '', dob: '', gender: '', desc: null }
  dobb: any

  constructor(public toastr: ToastrService) {
    this.profile = getItemJson(ADMIN_PROFILE)
    this.dobb = this.profile?.dob.slice(0, 10)
    console.log(this.profile);
    
  }

  changePassword(oldPass: HTMLInputElement, newPass: HTMLInputElement, rePass: HTMLInputElement) {
    console.log(oldPass.value + " = " + newPass.value + " = " + rePass.value)
    if (this.isOldPassValid(oldPass.value) && this.isPasswordValid(newPass.value) && this.isRePassMatch(newPass.value, rePass.value)) {
      postRequest(apiAdmin.CHANGE_PASSWORD + "?adminId=" + this.profile.id + "&oldPassword=" + oldPass.value + "&newPassword=" + newPass.value + "&confirmPassword=" + rePass.value, AuthorizationMode.BEARER_TOKEN, {})
        .then(res => {
          console.log(res)
          if (res.statusCode == 200) {
            showSuccess(this.toastr, "Thay đổi mật khẩu thành công!")
          } else {
            if(res.message === "Password have to have number of characters >= 8 and <= 20"){
              showError(this.toastr, "Độ dài mật khẩu không hợp lệ!")
            }else if(res.message === "Old password is not correct"){
              showError(this.toastr, "Mật khẩu cũ không đúng!")
            }else if(res.message === "Password and confirmPassword are not matching"){
              showError(this.toastr, "Mật khẩu mới không khớp. Vui lòng kiểm tra lại!")
            }else{
              showError(this.toastr, "Đổi mật khẩu thất bại, vui lòng thử lại sau!")
            }
          }
        })
        .catch(data => {
          console.log("Update fail", data);
          showError(this.toastr, "Thay đổi thất bại! Vui lòng thử lại sau.")
        })
    }
  }

  isOldPassValid(oldPass:any){
    if (oldPass.trim().length == 0) {
      showError(this.toastr, "Hãy nhập mật khẩu!")      
      return false;
    }
    return true;
  }

  isPasswordValid(password: string): boolean {
    if (password.trim().length == 0) {
      showError(this.toastr, "Hãy nhập mật khẩu mới!")      
      return false
    }

    if (password.length < 8 || password.length > 20) {
      showError(this.toastr, "Độ dài mật khẩu không hợp lệ!")
      return false;
    }

    if (password.includes(' ')) {
      showError(this.toastr, "Mật khẩu chứa khoảng trắng!")
      return false;
    }

    return true;
  }

  isRePassMatch(newPass: any, rePass: any) {
    if (rePass.trim().length == 0) {
      showError(this.toastr, "Hãy xác nhận mật khẩu!")
      return false
    }

    if (newPass !== rePass) {
      showError(this.toastr, "Mật khẩu xác nhận không trùng khớp!")
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
