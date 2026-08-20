import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';

@Component({
  selector: 'app-recruiter',
  templateUrl: './recruiter.component.html',
  styleUrls: ['./recruiter.component.css']
})
export class RecruiterComponent {
  recruiters: any
  searchText: any = ''
  pageIndex: any = 0
  pageSize: any = 10
  listDisplay: any
  companies: any
  pageLength: any
  listSearch: any

  constructor(public dialog: MatDialog) {
    this.getListRecruiter();
    this.getListCompany();
  }

  getListRecruiter() {
    getRequest(apiAdmin.GET_ALL_RECRUITER, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        this.recruiters = res?.data
        console.log(this.recruiters);

        this.getPageRange()
      })
      .catch(data => {
        console.warn("Call API GET RECRUITERS Fail:" + data)
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
      list = this.recruiters
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
        this.listSearch = this.recruiters.filter((obj: { fullName: string }) => obj?.fullName.toUpperCase().includes(this.searchText.toUpperCase()));
      }
      this.getPageRange()
    } catch (error) {
      console.warn('Fail in search:' + error)
    }
  }

  changeActive(id: any, isActive: any) {
    postRequest(apiAdmin.CHANGE_ACTIVE_RECRUITER + id, AuthorizationMode.BEARER_TOKEN, {})
      .then(res => {
        if (res.statusCode === 200) {
          console.log('success')
          for (let i = 0; i < this.listDisplay.length; i++) {
            const e = this.listDisplay[i];
            if (e.id === id) {
              this.listDisplay[i].isActive = !isActive
            }
          }
        }
      })
      .catch(data => {
        console.warn("Call API GET COMPANY Fail:" + data)
      })
  }

  getListCompany() {
    getRequest(apiAdmin.GET_ALL_COMPANY, AuthorizationMode.BEARER_TOKEN)
      .then(res => {
        this.companies = res?.data
        console.log(this.companies)
      })
      .catch(data => {
        console.warn("Call API GET COMPANY Fail:" + data)
      })
  }

  getCompanyName(cId: any){
    for (let i = 0; i < this.companies?.length; i++) {
      const elm = this.companies[i];
      if(elm.companyId === cId){
        return elm.companyName
      }
    }
    return ""
  }
}
