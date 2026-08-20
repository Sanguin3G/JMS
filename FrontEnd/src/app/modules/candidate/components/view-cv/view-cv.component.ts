import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { themeList } from 'src/app/modules/candidate/components/view-cv/constant';
import { postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { showError, showSuccess } from 'src/app/service/common';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  standalone: false,
   selector: 'app-view-cv',
   templateUrl: './view-cv.component.html',
   styleUrls: ['./view-cv.component.css']
})
export class ViewCvComponent {

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
      const d = date.split("-")
      let day = d[2]
      let month = d[1]
      let year = d[0]
      return day + "/" + month + "/" + year
   }

   constructor(
      public dialogRef: MatDialogRef<ViewCvComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private toastr: ToastrService,
      public dialog: MatDialog) {

      if (data.jd.dob) {
         this.dob = this.convertDate(data.jd.dob.split("T")[0]);
      }

      this.colorLeftHeader = themeList[data.jd.theme].colorLeftHeader
      this.colorRightHeader = themeList[data.jd.theme].colorRightHeader
      this.colorLeftInput = themeList[data.jd.theme].colorLeftInput
      this.ThemStyle = themeList[data.jd.theme].ThemStyle
      this.backgroudSelectedLink = themeList[data.jd.theme].backgroudSelectedLink
      this.fontCV = data.jd.font
   }

   // function for recruiter
   onClickSelect(item: any) {
      //call api update cv selected status
      postRequest(apiRecruiter.UPDATE_CV_SELECTED_STATUS + "?recruiterId=" + this.data.recruiterId + "&jobDescriptionId=" + item.jobDescriptionId + "&CVMatchingId=" + item.id, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               item.isSelected = item.isSelected == 0 ? 1 : 0
            }
         })
         .catch(data => {
            console.log(data);
         })
   }

   onClickRejectCv(item: any) {
      //API handle delete JD
      postRequest(`${apiRecruiter.REJECT_CV}?recruiterId=${this.data.recruiterId}&jobDescriptionId=${item.jobDescriptionId}&CVMatchingId=${item.id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               showSuccess(this.toastr, "Xoá hồ sơ thành công!")
               this.dialogRef.close();
            } else {
               showError(this.toastr, "Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
            }
         })
         .catch(data => {
            showError(this.toastr, "Xoá thất bại hồ sơ <br/> Vui lòng thử lại sau")
         })
   }

   openConfirmDialog(jd: any): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
         width: '350px',
         data: { title: 'Xác nhận', content: 'Bạn có xác nhận xóa CV khỏi danh sách không?' }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
         if (result === true) {
            this.onClickRejectCv(jd);
         }
      });
   }
}
