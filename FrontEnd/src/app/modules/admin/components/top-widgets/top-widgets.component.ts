import {Component,inject,OnInit} from '@angular/core';
import {ApiService,ApiResponse} from 'src/app/core/http/api.service';
import {AuthorizationMode} from 'src/app/service/constant';
import {AdminInsights} from '../../services/admin-insights';
@Component({standalone:false,selector:'app-top-widgets',templateUrl:'./top-widgets.component.html',styleUrls:['./top-widgets.component.css']})
export class TopWidgetsComponent implements OnInit{
 private readonly api=inject(ApiService);data:AdminInsights|null=null;isLoading=true;errorMessage='';
 ngOnInit():void{void this.loadStatistics();}
 async loadStatistics():Promise<void>{this.isLoading=true;this.errorMessage='';try{const r=await this.api.getRequest<ApiResponse<AdminInsights>>('/api/admin/insights',AuthorizationMode.BEARER_TOKEN,{days:30});if(r.statusCode!==200||!r.data)throw new Error();this.data=r.data;}catch{this.errorMessage='Không thể tải thống kê. Vui lòng thử lại.';}finally{this.isLoading=false;}}
 get recentApplications(){return this.data?.activity.reduce((n,r)=>n+r.applications,0)??0;}
 get recentJobs(){return this.data?.activity.reduce((n,r)=>n+r.jobs,0)??0;}
}
