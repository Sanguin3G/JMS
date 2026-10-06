import {Component,inject,DestroyRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ApiService,ApiResponse} from 'src/app/core/http/api.service';
import {AuthService} from 'src/app/core/auth/auth.service';
import {CurriculumVitae} from 'src/app/core/models/api.models';
import {apiCandidate,AuthorizationMode} from 'src/app/service/constant';
@Component({selector:'jms-cv-preview',standalone:false,templateUrl:'./cv-preview.component.html',styleUrls:['./cv-preview.component.css']})
export class CvPreviewComponent {
 private readonly api=inject(ApiService);private readonly auth=inject(AuthService);private readonly route=inject(ActivatedRoute);
 cv:CurriculumVitae|null=null;loading=true;error='';private version=0;
 constructor(){this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(p=>void this.load(Number(p.get('id'))));}
 async load(id:number):Promise<void>{const version=++this.version;this.loading=true;this.error='';this.cv=null;
 try{const result=await this.api.getRequest<ApiResponse<CurriculumVitae>>(`${apiCandidate.GET_CV_CANDIDATE_BY_ID}/${this.auth.currentUser()?.id}/${id}`,AuthorizationMode.BEARER_TOKEN);
 if(result.statusCode!==200||!result.data)throw new Error();if(version===this.version)this.cv=result.data;
 }catch{if(version===this.version)this.error='Không thể tải hồ sơ. Hồ sơ có thể đã bị xóa.';}finally{if(version===this.version)this.loading=false;}}
 print():void{window.print();}
}
