import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.css']
})
export class CompanyViewComponent {
  company: any;
  Url = environment.Url;
  linkMap: any;
  htmlContent: any;

  constructor(
    public dialogRef: MatDialogRef<CompanyViewComponent>,
    public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router) {

    getRequest(apiAdmin.GET_COMPANY_BY_ID + "/" + data, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        this.company = res?.data
        this.htmlContent = this.company?.description;
        console.log(this.company)
      })
      .catch(data => {
        console.warn("Get API fail!" + data);
      })
  }

  onClickView(jd: any){
    this.dialogRef.close();
    this.router.navigate(['/admin/view-jd', jd?.jobId]);
  }
}
