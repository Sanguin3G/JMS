import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { Choice, ENDINGS, Line, SCENES, VOICES, resolveEnding, validRoute } from './calibration-story';
interface SavedRun { route:number[]; savedAt:string }
const HISTORY='jms-calibration-history-v2';
const SESSION='jms-calibration-session-v2';
@Component({standalone:false,selector:'app-calibration',templateUrl:'./calibration.component.html',styleUrls:['./calibration.component.css']})
export class CalibrationComponent {
 readonly i18n=inject(I18nService);
 private readonly dialog=inject(Dialog);
 @ViewChild('sceneHeading') heading?:ElementRef<HTMLElement>;
 readonly scenes=SCENES; readonly voices=VOICES; readonly endings=ENDINGS;
 route:number[]=[]; started=false; feedback:Choice|null=null; saved=false; storageError=false;
 history:SavedRun[]=this.readHistory();
 resumeRoute:number[]=this.readSession();
 get current(){ return SCENES[Math.min(this.route.length,SCENES.length-1)]; }
 get ending(){ return this.route.length===SCENES.length&&!this.feedback ? resolveEnding(this.route) : null; }
 get art(){ return this.started ? (this.feedback ? SCENES[this.route.length-1].art : this.current.art) : 'city'; }
 get discovered(){ return new Set(this.history.map(run=>resolveEnding(run.route).id)); }
 get souvenirs(){ return this.route.map((n,i)=>SCENES[i].choices[n].souvenir); }
 l(value:Line){ return this.i18n.bilingual(value); }
 ui(vi:string,en:string){ return this.l({vi,en}); }
 count(id:string){ return this.route.filter((n,i)=>SCENES[i].choices[n].voice===id).length; }
 start(resume=false){ this.route=resume?[...this.resumeRoute]:[];this.started=true;this.feedback=null;this.saved=false;this.persistSession();this.focus(); }
 choose(index:number){ if(this.feedback||this.ending||!this.current.choices[index])return;this.feedback=this.current.choices[index];this.route=[...this.route,index]; }
 next(){ this.feedback=null;this.persistSession();this.focus(); }
 private focus(){ setTimeout(()=>this.heading?.nativeElement.focus(),0); }
 saveResult(){
  if(!this.ending||this.saved)return;
  const runs=[{route:[...this.route],savedAt:new Date().toISOString()},...this.history].slice(0,12);
  try{ localStorage.setItem(HISTORY,JSON.stringify(runs));this.history=runs;this.saved=true;this.storageError=false; }catch{this.storageError=true;}
 }
 async restart(){
  if(this.started&&!this.ending&&this.route.length){
   const ok=await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent,{data:{title:this.ui('Chơi lại từ đầu?','Start over?'),content:this.ui('Lượt đang chơi sẽ được thay bằng một lượt mới. Bộ sưu tập vẫn còn.','This replaces the current run. Your collection stays.')},width:'420px',maxWidth:'94vw'}).closed);
   if(!ok)return;
  }
  this.start();
 }
 async clearHistory(){
  const ok=await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent,{data:{title:this.ui('Xóa bộ sưu tập?','Clear the collection?'),content:this.ui('Xóa các kết thúc đã lưu trên thiết bị này. Bạn có thể khám phá lại khi chơi.','Remove saved endings from this device. You can discover them again by playing.')},width:'420px',maxWidth:'94vw'}).closed);
  if(!ok)return;
  try{localStorage.removeItem(HISTORY);this.history=[];this.saved=false;this.storageError=false;}catch{this.storageError=true;}
 }
 private readHistory():SavedRun[]{
  try{const value:unknown=JSON.parse(localStorage.getItem(HISTORY)??'[]');
   return Array.isArray(value)?value.filter((x):x is SavedRun=>!!x&&validRoute(x.route)&&x.route.length===SCENES.length&&typeof x.savedAt==='string'&&Number.isFinite(Date.parse(x.savedAt))).slice(0,12):[];
  }catch{return [];}
 }
 private readSession():number[]{try{const value:unknown=JSON.parse(localStorage.getItem(SESSION)??'[]');return validRoute(value)&&value.length<SCENES.length?value:[];}catch{return [];}}
 private persistSession(){try{if(this.route.length>=SCENES.length){localStorage.removeItem(SESSION);this.resumeRoute=[];}else{localStorage.setItem(SESSION,JSON.stringify(this.route));this.resumeRoute=[...this.route];}}catch{this.storageError=true;}}
}
