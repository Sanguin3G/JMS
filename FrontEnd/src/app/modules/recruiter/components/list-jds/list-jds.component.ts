import { Component, ViewEncapsulation } from '@angular/core';
import { getRequest, postRequest, postFileRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { getToken, saveItem, signOut, getProfile } from 'src/app/service/localstorage';
import { ToastrService } from 'ngx-toastr';
import { showError, showSuccess } from 'src/app/service/common';


@Component({
  standalone: false,
   selector: 'app-list-jds',
   templateUrl: './list-jds.component.html',
   styleUrls: ['./list-jds.component.css'],
   encapsulation: ViewEncapsulation.None
})

export class ListJdsComponent {

   listJds: any;
   page = 0;
   passenger: any;
   itemsPerPage = 8;
   totalItems = 0;
   isDivHidden: boolean = false;
   profile: any;
   tabSelected: any = 0
   listRunning: any = []
   listExpired: any = []
   listDraft: any = []
   firstTabTitle= "Đang tuyển dụng"
   secondTabTitle= "Đã hết hạn"

   inputSearch = ""

   getListPage(totalPage: number) {
      let list = []
      for (let i = 0; i < totalPage; i++) {
         let a = i + 1
         list.push(a)
      }
      return list
   }

   constructor(private router: Router, public dialog: MatDialog, private toastr: ToastrService) {
      this.profile = getProfile()

      getRequest(`${apiRecruiter.GET_COMPANY_JDS_PAGING}/${this.profile.companyId}/${this.page}`, AuthorizationMode.BEARER_TOKEN)
         .then(res => {
            console.log(res?.data);
            if(res.data != null){
               this.listRunning = res?.data
               this.totalItems = res?.objectLength
   
               for (let i = 0; i < this.listRunning.length; i++) {
                  this.listRunning[i]['isShow'] = true;
               }
               
               this.firstTabTitle = 'ĐANG TUYỂN DỤNG (' + res.data.length + ')'
               this.listJds = this.listRunning
            }else{
               this.firstTabTitle = 'ĐANG TUYỂN DỤNG (0)'
               this.listJds = []
            }
            
         })
         .catch(data => {
            console.warn('Lỗi', `${apiRecruiter.GET_COMPANY_JDS_PAGING}/${this.profile.companyId}/${this.page}`, data);
         })

      this.getListExpired()
   }

   pageChanged(page: any) {
      this.page = page
      getRequest(`${apiRecruiter.GET_COMPANY_JDS_PAGING}/${this.profile.companyId}/${this.page}`, AuthorizationMode.BEARER_TOKEN)
         .then(res => {
            this.listJds = res?.data
            this.totalItems = res?.objectLength
         })
         .catch(data => {
            console.warn('Lỗi', `${apiRecruiter.GET_COMPANY_JDS_PAGING}/${this.profile.companyId}/${this.page}`, data);
         })
   }

   onClickView(jd: any) {
      this.router.navigate(['/recruiter/view-jd-detail', jd?.jobId]);
   }

   onClickUpdate(jd: any) {
      this.router.navigate(['/recruiter/jd-detail', jd?.jobId]);
   }

   onClickDelete(jd: any) {
      //API handle delete JD
      postRequest(`${apiRecruiter.DELETE_JD_BY_ID}/${this.profile.id}/${jd?.jobId}`, AuthorizationMode.BEARER_TOKEN, {})
         .then(res => {
            if (res.statusCode == 200) {
               showSuccess(this.toastr, "Xoá công việc thành công")
               jd.isShow = false;
            }
         })
         .catch(data => {
            showError(this.toastr, "Xoá công việc thất bại <br/> Vui lòng thử lại sau")
         })
   }

   openDialog(jd: any): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
         width: '350px',
         data: { title: 'Xác nhận', content: 'Bạn có xác nhận xóa bài viết không?' }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
         if (result === true) {
            this.onClickDelete(jd);
         } else if (result === false) {
         } else {
         }
      });
   }

   getListExpired() {
      const recruiterId = getProfile().id;

      getRequest(`${apiRecruiter.GET_LIST_JD_EXPIRED}/${recruiterId}`, AuthorizationMode.BEARER_TOKEN)
         .then(res => {
            console.log(res?.data);
            this.listExpired = res?.data

            for (let i = 0; i < this.listExpired.length; i++) {
               this.listExpired[i]['isShow'] = true;
            }
            this.secondTabTitle = 'ĐÃ HẾT HẠN (' + this.listExpired.length + ')'
         })
         .catch(data => {
            console.warn('Fail to get api list expired jd', data);
         })
   }

   setTabIndexValue(evt: any) {
      this.tabSelected = evt
      this.listJds = this.tabSelected == 0 ? this.listRunning : (evt == 1 ? this.listExpired : this.listDraft)
   }

   searchChange(){
      const listSearch = []
      const data = this.tabSelected == 0 ? this.listRunning : this.listExpired

      if(this.inputSearch === ""){
         this.listJds = this.tabSelected == 0 ? this.listRunning : (this.tabSelected == 1 ? this.listExpired : this.listDraft)
         return
      }

      for (let i = 0; i < data.length; i++) {
         const elm = data[i]
         const title = elm.title.toUpperCase();
         if(title.includes(this.inputSearch.toUpperCase())){
            listSearch.push(elm)
         }
      }
      this.listJds = listSearch
      return
   }
}