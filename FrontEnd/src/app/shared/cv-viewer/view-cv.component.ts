import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { normalizeCv } from './cv-document';
export interface CvViewerData {jd:unknown;recruiterId?:number;}
@Component({standalone:false,selector:'app-view-cv',templateUrl:'./view-cv.component.html',styleUrls:['./view-cv.component.css']})
export class ViewCvComponent {
 readonly cv;
 constructor(public dialogRef:DialogRef<unknown,ViewCvComponent>,@Inject(DIALOG_DATA)public data:CvViewerData){this.cv=normalizeCv(data.jd);}
}
