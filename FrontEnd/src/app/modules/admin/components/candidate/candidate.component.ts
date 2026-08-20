import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Toast, ToastrService } from 'ngx-toastr';
import { ViewCvComponent } from 'src/app/modules/candidate/components/view-cv/view-cv.component';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { showInfo } from 'src/app/service/common';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';

interface cv {
  id: any,
  candidateId: any,
  careerGoal: any,
  employmentTypeName: any,
  phone: any,
  displayName: any,
  genderDisplay: any,
  displayEmail: any,
  address: any,
  dob: any,
  createdDateDisplay: any,
  lastUpdateDateDisplay: any,
  level: { description: any },
  jobExperience: [
    { ComapanyName: '', Position: '', FromDate: '', ToDate: '', Description: any, EmploymentTypeName: '' }],
  skill: [
    { title: any, SkillDescription: any }],
  project: [
    { ProjectName: '', Description: '', FromDate: '', ToDate: '', IsStillWorking: '' }],
  award: [
    { AwardName: '', Description: '', FromYear: '' }],
  avatarURL: any,
  categoryName: any,
  categoryId: any,
  genderId: any,
  isFindingJob: any,
  cvTitle: any,
  theme: any,
  font: any,
  certificate: [
    { CertificateName: any, CertificateProvider: any, credentialURL: any, ExpiredDate: any, IssuedDate: any }],
  education: [
    { SchoolName: any, MajorName: any, Description: any, FromYear: any, ToYear: any, StillLearning: any }],
}
@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent {
  candidates: any
  searchText: any = ''
  pageIndex: any = 0
  pageSize: any = 10
  listDisplay: any
  pageLength: any
  listSearch: any

  constructor(public dialog: MatDialog, public toastr: ToastrService) {
    this.getListCandidate();
  }

  getListCandidate() {
    getRequest(apiAdmin.GET_ALL_CANDIDATE, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        this.candidates = res?.data
        this.getPageRange()
        console.log(this.candidates);
        
      })
      .catch(data => {
        console.warn("Call API GET COMPANY Fail:" + data)
      })
  }

  handlePage(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getPageRange();
  }

  getPageRange() {
    let list = null
    if(this.searchText.length == 0){
      list = this.candidates
    }else{
      list = this.listSearch
    }
    this.pageLength = list.length
    const start = this.pageIndex * this.pageSize;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, list.length);
    this.listDisplay = list.slice(start, end)
  }

  onInputChange() {
    try {
      if (this.searchText.length != 0) {
        this.listSearch = this.candidates.filter((obj: { fullName: string }) => obj?.fullName.toUpperCase().includes(this.searchText.toUpperCase()));
      }
      this.getPageRange()
    } catch (error) {
      console.warn('Fail in search:' + error)
    }
  }

  async openCVDialog(id: any) {
    let cv: cv
    let jd = await this.getPrimaryCv(id)
    if (jd == null) {
      showInfo(this.toastr, "Người dùng không bật tìm việc!")
      return
    }
    // API response wrong format, re-format to match cv-format
    cv = jd

    cv.education = jd.educations
    for (let i = 0; i < jd.educations.length; i++) {
      const e = jd.educations[i];
      cv.education[i] = { SchoolName: e.schoolName, MajorName: e.majorName, Description: e.description, FromYear: e.fromYear, ToYear: e.toYear, StillLearning: e.stillLearning }
    }

    cv.jobExperience = jd.jobExperiences
    for (let i = 0; i < jd.jobExperiences.length; i++) {
      const elm = jd.jobExperiences[i];
      cv.jobExperience[i] = { ComapanyName: elm.companyname, Position: elm.position, FromDate: elm.fromDate, ToDate: elm.toDate, Description: elm.description, EmploymentTypeName: elm.employmentTypeName }
    }

    cv.project = jd.projects
    for (let i = 0; i < jd.projects.length; i++) {
      const e = jd.projects[i];
      cv.project[i] = { ProjectName: e.projectName, Description: e.description, FromDate: e.fromDate, ToDate: e.toDate, IsStillWorking: e.isStillWorking }
    }

    cv.skill = jd.skills
    for (let i = 0; i < jd.skills.length; i++) {
      const elm = jd.skills[i];
      const c = cv.skill[i];
      c.title = elm.title
      c.SkillDescription = elm.skillDescription
    }

    cv.certificate = jd.certificates
    for (let i = 0; i < jd.certificates.length; i++) {
      const elm = jd.certificates[i];
      cv.certificate[i] = { CertificateName: elm.certificateName, CertificateProvider: elm.certificateProvider, credentialURL: elm.credentialURL, ExpiredDate: elm.expiredDate, IssuedDate: elm.issuedDate }
    }

    cv.award = jd.awards
    for (let i = 0; i < jd.awards.length; i++) {
      const elm = jd.awards[i];
      cv.award[i] = { AwardName: elm.awardName, Description: elm.description, FromYear: elm.fromYear }
    }

    cv.level = { description: jd.levelTitle }
    cv.dob = this.convertDateFormat(jd.dob)

    const dialogRef = this.dialog.open(ViewCvComponent, {
      width: '60%',
      height: '100%',
      data: { jd: jd }
    });
  }

  async getPrimaryCv(id: any) {
    let listCV: string | any[] = []

    await getRequest(apiAdmin.GET_ALL_CV_BY_ID + id, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        listCV = res?.data
      })
      .catch(data => {
        console.warn("Call API GET COMPANY Fail:" + data)
      })

    for (let i = 0; i < listCV.length; i++) {
      const elm = listCV[i];
      if (elm.isFindingJob) {
        console.log(elm)
        return elm
      }
    }
    return null
  }

  convertDateFormat(inputDate: any) {
    // Parse the input date string
    let parts = inputDate.split('/');
    let year = parseInt(parts[2], 10);
    let month = parseInt(parts[0], 10);
    let day = parseInt(parts[1], 10);

    // Create a Date object
    let dateObject = new Date(year, month - 1, day);

    // Format the date as "dd-MM-yyyy"
    let formattedDate = `${dateObject.getDate().toString().padStart(2, '0')}-${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getFullYear()}`;

    return formattedDate;
  }

  changeActive(id: any, isActive: any){
    postRequest(apiAdmin.CHANGE_ACTIVE_CANDIDATE + id, AuthorizationMode.BEARER_TOKEN, {})
      .then(res => {
        if(res.statusCode === 200){
          console.log('success')
          for (let i = 0; i < this.listDisplay.length; i++) {
            const e = this.listDisplay[i];
            if(e.id === id){
              this.listDisplay[i].isActive = !isActive
            }
          }
        }
      })
      .catch(data => {
        console.warn("Call API GET COMPANY Fail:" + data)
      })
  }

  handleNewLine(input: string) {
    const modifiedString = input.replace(/-/g, '\n-');
    return modifiedString;
  }
}
