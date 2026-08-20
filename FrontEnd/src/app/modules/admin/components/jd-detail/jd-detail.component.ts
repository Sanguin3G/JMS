import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiAdmin, apiRecruiter } from 'src/app/service/constant';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'app-jd-detail',
  templateUrl: './jd-detail.component.html',
  styleUrls: ['./jd-detail.component.css']
})
export class JdDetailComponent {
  jdDetail: any
  id: any
  listCandidate: any
  jobDescription: any
  jobBenefit: any
  jobRequirement: any
  matchOption: any
  descriptionJd: any
  jobRequirementJd: any
  skillRequirementJd: any
  experienceRequirementJd: any
  educationRequirementJd: any
  candidateBenefitJd: any
  isMatching: boolean = false;
  Url = environment.Url;

  showTokenExpiration() {
    this.toastr.info('Phiên đăng nhập hết hạn', 'Thông báo', {
       progressBar: true,
       timeOut: 3000,
    });
 }

  constructor(public dialog: MatDialog, private route: ActivatedRoute, private toastr: ToastrService) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    //get jd detail
    getRequest(apiAdmin.GET_JD_BY_ID + "/" + this.id, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        this.jdDetail = res.data
        console.log(res);
        this.handleData();
      })
      .catch(data => {
        console.warn(data);
      })
  }

  handleData() {
    this.descriptionJd = this.handleText(this.jdDetail.jobDetail);
    this.candidateBenefitJd = this.handleText(this.jdDetail.candidateBenefit);
    this.skillRequirementJd = this.handleText(this.jdDetail.skillRequirement);
    this.experienceRequirementJd = this.handleText(this.jdDetail.experienceRequirement);
    this.educationRequirementJd = this.handleText(this.jdDetail.educationRequirement);
    // this.jobRequirementJd = this.handleText(skillRq) + '\n' + this.handleText(expRq) + '\n' + this.handleText(eduRq)
  }

  handleText(text: string) {
    const lines: string[] = text.trim().split('\n');
    const linesWithHyphen: string[] = lines.map((line: string) => (line.startsWith('-') ? line : `${line}`));
    const newText: string = linesWithHyphen.join('\n');
    return newText
  }
}
