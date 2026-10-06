import {Component,inject,DestroyRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ApiService,ApiResponse} from 'src/app/core/http/api.service';
import {AuthorizationMode,apiAdmin} from 'src/app/service/constant';
import {JobDetail} from 'src/app/core/models/api.models';
@Component({standalone:false,selector:'app-jd-detail',templateUrl:'./jd-detail.component.html',styleUrls:['./jd-detail.component.css']})
export class JdDetailComponent {
 private readonly api=inject(ApiService);private readonly route=inject(ActivatedRoute);
 jdDetail:JobDetail|null=null;loading=true;error='';private version=0;
 constructor(){this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(p=>void this.load(Number(p.get('id'))));}
 async load(id:number):Promise<void>{const version=++this.version;this.loading=true;this.error='';this.jdDetail=null;
 try{const r=await this.api.getRequest<ApiResponse<JobDetail>>(apiAdmin.GET_JD_BY_ID+'/'+id,AuthorizationMode.BEARER_TOKEN);
 if(r.statusCode!==200||!r.data)throw new Error();if(version===this.version)this.jdDetail=r.data;
 }catch{if(version===this.version)this.error='Không thể tải tin tuyển dụng.';}finally{if(version===this.version)this.loading=false;}}
}
