import { inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ApiService } from 'src/app/core/http/api.service';

import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
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
   genderDisplay: any


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

   invalidName: any = false
   invalidNameMsg: any
   invalidPhone: any = false
   invalidPhoneMsg: any
   invalidDob: any = false
   invalidDobMsg: any

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


   constructor(public toastr: NotificationService, private router: Router) {
      this.profile = this.auth.getProfile()
      this.getCompany();
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

   SubmitFormChangePassword() {
      if (this.validAllFiled()) {

         this.api.postRequest(`${apiRecruiter.CHANGE_PASSWORD}?recruiterId=${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, { oldPassword: this.oldPassword, newPassword: this.newPassword, confirmPassword: this.conformPassword })
            .then(res => {

               if (res.statusCode == 200) {
                  this.toastr.success("Thay đổi mật khẩu thành công")
                  this.oldPassword = ""
                  this.newPassword = ""
                  this.conformPassword = ""
               }
               if (res.statusCode == 400) {
                  if (res?.message == "Old password is not correct") this.toastr.error("Mật khẩu cũ không chính xác")
               }
            })
            .catch(res => {
               this.toastr.error("Đã có lỗi xảy ra")
               console.warn(res);

            })
      } else {
         // this.toastr.info('Điền các trường ở bên dưới')
      }
   }

   getCompany() {
      this.api.getRequest(apiRecruiter.GET_COMPANY_BY_ID + "/" + this.profile.companyId, AuthorizationMode.PUBLIC)
         .then(res => {
            this.company = res?.data
         })
         .catch(data => {
            console.warn("Get API fail!" + data);
         })
   }

   updateProfile(fullname: HTMLInputElement, gender: HTMLSelectElement, phone: HTMLInputElement, dob: HTMLInputElement) {
      if (this.validatePhoneNumber(phone.value.trim()) && this.validateDate(dob.value.trim()) && this.validateString(fullname.value)) {
         this.newProfile.fullname = fullname.value == "" ? this.profile.fullName : fullname.value
         this.newProfile.phone = this.validatePhoneNumber(phone.value.trim()) ? phone.value : this.profile.phoneNumber
         this.newProfile.dob = this.validateDate(dob.value.trim()) ? this.convertDateFormat(dob.value) : this.profile.doB_Display
         this.newProfile.gender = gender.value == "" ? this.profile.genderTitle : gender.value
      } else {
         return
      }
      // this.newProfile.fullname = fullname.value == "" ? this.profile.fullName : fullname.value
      // this.newProfile.phone = this.validatePhoneNumber(phone.value.trim()) ? phone.value : this.profile.phoneNumber
      // this.newProfile.dob = this.validateDate(dob.value.trim()) ? dob.value : this.profile.doB_Display
      // this.newProfile.gender = gender.value == "" ? this.profile.genderTitle : gender.value

      this.api.postRequest(apiRecruiter.UPDATE_PROFILE + "?recruiterId=" + this.profile.id + "&fullName=" + this.newProfile.fullname + "&phoneNumber=" + this.newProfile.phone + "&DOB=" + this.newProfile.dob + "&genderId=1&description=" + this.newProfile.desc, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {

            if (res.statusCode == 200) {
               this.profile.fullName = this.newProfile.fullname
               this.profile.phoneNumber = this.newProfile.phone
               this.profile.doB_Display = dob.value
               this.profile.genderTitle = this.newProfile.gender

               this.auth.updateProfile(this.profile);
               this.toastr.success("Cập nhật thông tin thành công!")
            }else if(res.message === "DOB have to >= 18 and < 100"){
               this.toastr.error("Ngày sinh không hợp lệ. Yêu cầu phải từ 18 tuổi trở lên.")
            } else {
               this.toastr.error("Cập nhật thất bại! Vui lòng thử lại.")
            }
         })
         .catch(data => {

            this.toastr.error("Cập nhật thất bại! Vui lòng thử lại.")
         })
   }

   validatePhoneNumber(phoneNumber: string): boolean {
      if (!/^\d+$/.test(phoneNumber)) {
         this.invalidPhone = true
         this.invalidPhoneMsg = 'Số điện thoại không hợp lệ'
         return false;
      }

      if (phoneNumber.length < 9 || phoneNumber.length > 10) {
         this.invalidPhone = true
         this.invalidPhoneMsg = 'Độ dài không hợp lệ'
         return false;
      }

      this.invalidPhone = false
      return true;
   }

   validateDate(dateString: string): boolean {
      const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!regex.test(dateString)) {
         this.invalidDob = true
         this.invalidDobMsg = 'Ngày sinh không hợp lệ! (dd/MM/yyyy)'
         return false
      }

      const parts = dateString.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
         this.invalidDob = true
         this.invalidDobMsg = 'Ngày sinh không hợp lệ! (dd/MM/yyyy)'
         return false; // Không phải là số
      }

      const maxDays = new Date(year, month, 0).getDate();

      if (day < 1 || day > maxDays || month < 1 || month > 12) {
         this.invalidDob = true
         this.invalidDobMsg = 'Ngày sinh không hợp lệ!'
         return false; // Ngày tháng không hợp lệ
      }

      this.invalidDob = false
      return true;
   }

   validateString(string: any) {
      const regex = /^[ a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ\s']+$/;


      if (string == null || string.trim().length == 0) {
         this.invalidName = true
         this.invalidNameMsg = 'Tên không được để trống!'
         return false
      }

      if (!regex.test(string)) {
         this.invalidName = true
         this.invalidNameMsg = 'Tên không được chứa số hoặc ký tự đặc biệt!'
         return false
      }

      this.invalidName = false
      return true
   }

   getProfile = () => {
      this.api.postRequest(apiRecruiter.GET_PROFILE_RECRUITER, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               this.profile = res.data

               setTimeout(() => {
                  this.auth.updateProfile(res.data);
               }, 1000);
            }
         })
         .catch(error => {

         })
   }

   getFile(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {

         let formData: FormData = new FormData();
         formData.append('file', file, file.name);

         this.api.postFileRequest(`${apiRecruiter.UPDATE_IMAGE_RECRUITER}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, formData)
            .then(res => {
               if (res.statusCode == 200) {

                  this.getProfile()
                  this.toastr.success("Chỉnh sửa ảnh thành công")
               } else {
                  this.toastr.error("Ảnh không hợp lệ, vui lòng thử lại!")
               }
            })
            .catch(data => {
               this.toastr.error("Tải ảnh mới thất bại, vui lòng thử lại!")
            })
      }
   }

   convertDateFormat(inputDate: string): string {
      const parts = inputDate.split('/');

      if (parts.length === 3) {
         const outputDate = `${parts[1]}/${parts[0]}/${parts[2]}`;
         return outputDate;
      } else {
         return inputDate;
      }
   }

   reverseDateFormat(inputDate: string): string {
      const parts = inputDate.split('/');

      if (parts.length === 3) {
         const outputDate = `${parts[1]}/${parts[0]}/${parts[2]}`;
         return outputDate;
      } else {
         return inputDate;
      }
   }

   encodeText(text: any){
      const encode = `${encodeURIComponent(text.trim())}`;
      return encode
   }
}
