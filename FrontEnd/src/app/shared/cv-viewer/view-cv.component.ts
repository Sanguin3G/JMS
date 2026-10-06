import { Component, Inject, inject } from '@angular/core';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { environment } from 'src/environments/environment';
import { themeList } from './constant';
import { ApiService } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';

import { NotificationService } from 'src/app/core/notifications/notification.service';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  standalone: false,
   selector: 'app-view-cv',
   templateUrl: './view-cv.component.html',
   styleUrls: ['./view-cv.component.css']
})
export class ViewCvComponent {
   private readonly api = inject(ApiService);

   hideImage = "block"
   displayImage = "none"
   displayChange = "none"
   apiURL = environment.Url;
   fontCV = "Sans-serif"

   colorLeftHeader = "#444444"
   colorRightHeader = "#111111"
   colorLeftInput = "#111111"
   ThemStyle = "Theme6"
   backgroudSelectedLink = `${environment.Url}/assets/images/theme6.jpg`

   fileSrc = ""
   dob: any

   convertDate(date: string) {
      if (date.includes('/')) return date;
      const parts = date.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
   }

   constructor(
      public dialogRef: DialogRef<unknown, ViewCvComponent>,
      @Inject(DIALOG_DATA) public data: any,
      private toastr: NotificationService,
      public dialog: Dialog) {

      if (data.jd.dob) {
         this.dob = this.convertDate(data.jd.dob.split("T")[0]);
      }

      this.colorLeftHeader = themeList[data.jd.theme ?? 6].colorLeftHeader
      this.colorRightHeader = themeList[data.jd.theme ?? 6].colorRightHeader
      this.colorLeftInput = themeList[data.jd.theme ?? 6].colorLeftInput
      this.ThemStyle = themeList[data.jd.theme ?? 6].ThemStyle
      this.backgroudSelectedLink = themeList[data.jd.theme ?? 6].backgroudSelectedLink
      this.fontCV = data.jd.font
   }

   // function for recruiter
   onClickSelect(item: any) {
      //call api update cv selected status
      this.api.postRequest(apiRecruiter.UPDATE_CV_SELECTED_STATUS + "?recruiterId=" + this.data.recruiterId + "&jobDescriptionId=" + item.jobDescriptionId + "&CVMatchingId=" + item.id, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               item.isSelected = item.isSelected == 0 ? 1 : 0
            }
         })
         .catch(data => {

         })
   }

   onClickRejectCv(item: any) {
      //API handle delete JD
      this.api.postRequest(`${apiRecruiter.REJECT_CV}?recruiterId=${this.data.recruiterId}&jobDescriptionId=${item.jobDescriptionId}&CVMatchingId=${item.id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               this.toastr.success("Xoá hồ sơ thành công!")
               this.dialogRef.close();
            } else {
               this.toastr.error("Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
            }
         })
         .catch(data => {
            this.toastr.error("Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
         })
   }

   openConfirmDialog(jd: any): void {
      const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, { ariaLabelledBy: "confirm-title", ariaDescribedBy: "confirm-message",
         width: '350px',
         data: { title: 'Xác nhận', content: 'Bạn có xác nhận xóa CV khỏi danh sách không?' }
      });

      dialogRef.closed.subscribe((result) => {
         if (result === true) {
            this.onClickRejectCv(jd);
         }
      });
   }
}
