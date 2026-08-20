import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate } from 'src/app/service/constant';
import { getProfile, isLogin, signOut } from 'src/app/service/localstorage';
import { environment } from 'src/environments/environment';
import { ViewCvComponent } from '../view-cv/view-cv.component';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { showError, showSuccess } from 'src/app/service/common';

@Component({
   selector: 'app-my-cvs',
   templateUrl: './my-cvs.component.html',
   styleUrls: ['./my-cvs.component.css']
})

export class CandidateMyCvsComponent {
   Url = environment.Url;
   list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
   listCVs: any;
   profile: any
   listJds: any

   @ViewChild('templateScroller') private templateScroller?: ElementRef<HTMLUListElement>;

   scrollTemplates(direction: 1 | -1) {
      this.templateScroller?.nativeElement.scrollBy({
         left: direction * 250,
         behavior: 'smooth'
      });
   }

   convertDate(date: string){
      var d = date.split("/")
      if(d){
         return `${d[1]}/${d[0]}/${d[2]}`
      }  
      return ''
   }

   constructor(public dialog: MatDialog, private router: Router, private toastr: ToastrService) {

      this.profile = getProfile();

      getRequest(`${apiCandidate.GET_ALL_CV_BY_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            this.listCVs = res?.data

            this.listCVs.map((item:any, index: any) =>  this.listCVs[index].lastUpdateDateDisplay = this.convertDate(item.lastUpdateDateDisplay))
            console.log(this.listCVs);
         })
         .catch(data => {
         })


      getRequest(apiCandidate.GET_ALL_JDS_PAGING + "/" + 1, AuthorizationMode.BEARER_TOKEN)
         .then(res => {
            if (res?.statusCode == 200) {
               this.listJds = res?.data
            }
         })
         .catch(data => {
         })
   }

   onClickJD(jd: any) {
      this.router.navigate(['/candidate/jd-detail/', jd?.jobId]);
   }

   gotoEditCV(id: number) {
      this.router.navigate([`/candidate/update-cv/`]);
   }


   onClickDelete(id: number) {
      postRequest(`${apiCandidate.DELETE_CV_BY_ID}?candidateId=${this.profile.id}&cvId=${id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res?.statusCode) {
               showSuccess(this.toastr, "Xoá hồ sơ thành công")

               getRequest(`${apiCandidate.GET_ALL_CV_BY_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, {})
                  .then(res => {
                     this.listCVs = res?.data
                     this.listCVs.map((item:any, index: any) =>  this.listCVs[index].lastUpdateDateDisplay = this.convertDate(item.lastUpdateDateDisplay))
                  })
                  .catch(data => {
                     console.warn(apiCandidate.GET_ALL_CV_BY_ID, data);
                  })
            }
         })
         .catch(data => {
            showError(this.toastr, "Xoá hồ sơ thất bại")
         })

   }

   gotoDeleteCV(id: number) {

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
         width: '350px',
         data: { title: 'Xác nhận', content: 'Bạn có xác nhận xóa hồ sơ không?' }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
         if (result === true) {
            this.onClickDelete(id);
         } else if (result === false) {
         } else {
         }
      });
   }

   gotoUpdateCurrentCv(id: number) {

      postRequest(`${apiCandidate.CHANGE_FINDING_JOB_STATUS}?candidateId=${this.profile.id}&cvId=${id}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res?.statusCode == 200) {
               getRequest(`${apiCandidate.GET_ALL_CV_BY_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, {})
                  .then(res => {
                     this.listCVs = res?.data
                     this.listCVs.map((item:any, index: any) =>  this.listCVs[index].lastUpdateDateDisplay = this.convertDate(item.lastUpdateDateDisplay))
                     console.log(this.listCVs);
                  })
                  .catch(data => {
                  })

            } else {
               showError(this.toastr, "Thay đổi trạng thái thất bại, vui lòng thử lại sau")
            }
         })
         .catch(data => {
            showError(this.toastr, "Thay đổi trạng thái thất bại, vui lòng thử lại sau")
            console.error(apiCandidate.CHANGE_FINDING_JOB_STATUS);
         })

   }
}
