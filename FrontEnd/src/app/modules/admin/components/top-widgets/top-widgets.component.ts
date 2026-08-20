import { Component } from '@angular/core';
import { getRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiAdmin } from 'src/app/service/constant';

@Component({
  selector: 'app-top-widgets',
  templateUrl: './top-widgets.component.html',
  styleUrls: ['./top-widgets.component.css']
})
export class TopWidgetsComponent {

  company: any
  jd: any
  cv: any
  matching: any

  constructor(){
    this.getStatistic()
  }

  getStatistic(){
    getRequest(apiAdmin.GET_STATISTIC, AuthorizationMode.BEARER_TOKEN)
         .then(res => {
            if(res.statusCode === 200){
              this.company = res.data.totalCompany
              this.jd = res.data.totalJDs
              this.cv = res.data.totalCV
              this.matching = res.data.totalMatching
            }else{
              this.company = "???"
              this.jd = "???"
              this.cv = "???"
              this.matching = "???"
            }
         })
         .catch(data => {
            console.warn("Get API fail!" + data);
         })
  }
}
