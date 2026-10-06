import { inject, Component, Inject } from '@angular/core';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'app-company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['../../../../shared/company-profile.css']
})
export class CompanyViewComponent {
   private readonly api = inject(ApiService);
  company: any;
   loading = true;
   error = '';
  Url = environment.Url;
  linkMap: any;
  htmlContent: any;

  constructor(
    public dialogRef: DialogRef<unknown, CompanyViewComponent>,
    public dialog: Dialog, @Inject(DIALOG_DATA) public data: any,
    private router: Router) {

    this.api.getRequest(apiAdmin.GET_COMPANY_BY_ID + "/" + data, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        if (res.statusCode !== 200 || !res.data) throw new Error();
            this.company = res.data
        this.htmlContent = this.company?.description;

      })
      .catch(data => {
        this.error = 'Không thể tải thông tin công ty. Hãy đóng và thử lại.';
      }).finally(() => { this.loading = false; });
  }

  onClickView(jd: any){
    this.dialogRef.close();
    this.router.navigate(['/admin/view-jd', jd?.jobId]);
  }
}
