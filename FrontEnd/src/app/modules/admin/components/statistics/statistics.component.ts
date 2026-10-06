import {Component,inject,DestroyRef} from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ApiService,ApiResponse} from 'src/app/core/http/api.service';
import {AuthorizationMode} from 'src/app/service/constant';
import {AdminInsights} from '../../services/admin-insights';
import {I18nService} from 'src/app/core/i18n/i18n.service';
@Component({selector:'jms-admin-statistics',standalone:false,templateUrl:'./statistics.component.html',styleUrls:['./statistics.component.css']})
export class StatisticsComponent{
 private readonly api=inject(ApiService);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);
 readonly i18n=inject(I18nService);data:AdminInsights|null=null;days=30;loading=true;error='';private version=0;
 constructor(){this.route.queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(p=>{const days=Number(p.get('days'));this.days=[30,90,365].includes(days)?days:30;void this.load();});}
 changeRange():void{void this.router.navigate([],{relativeTo:this.route,queryParams:{days:this.days},queryParamsHandling:'merge'});}
 async load():Promise<void>{const version=++this.version;this.loading=true;this.error='';
 try{const r=await this.api.getRequest<ApiResponse<AdminInsights>>('/api/admin/insights',AuthorizationMode.BEARER_TOKEN,{days:this.days});if(r.statusCode!==200||!r.data)throw new Error();if(version===this.version)this.data=r.data;
 }catch{if(version===this.version)this.error='Không thể tải thống kê. Vui lòng thử lại.';}finally{if(version===this.version)this.loading=false;}}
 get buckets(){if(!this.data)return[];const size=this.days===30?5:this.days===90?15:60;const groups=[];for(let i=0;i<this.data.activity.length;i+=size){const rows=this.data.activity.slice(i,i+size);groups.push({date:rows[0].date,jobs:rows.reduce((n,r)=>n+r.jobs,0),applications:rows.reduce((n,r)=>n+r.applications,0)});}return groups;}
 get maximum(){return Math.max(1,...this.buckets.flatMap(x=>[x.jobs,x.applications]));}
 date(value:string):string{return new Intl.DateTimeFormat(this.i18n.locale(),{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value));}
 get rangeJobs(){return this.data?.activity.reduce((n,r)=>n+r.jobs,0)??0;}
 get rangeApplications(){return this.data?.activity.reduce((n,r)=>n+r.applications,0)??0;}
 status(label:string):string{return ({completed:'Có giải thích AI','not-configured':'Chỉ theo quy tắc',fallback:'AI không khả dụng',failed:'AI không khả dụng',legacy:'Dữ liệu lịch sử'} as Record<string,string>)[label]??label;}
}

