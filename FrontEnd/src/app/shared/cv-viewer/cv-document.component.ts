import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nModule } from 'src/app/core/i18n/i18n.module';
import { I18nService } from 'src/app/core/i18n/i18n.service';
import { ImageFallbackDirective } from '../image-fallback/image-fallback.directive';
import { CvDocument, normalizeCv, CvSectionItem } from './cv-document';
import { themeList } from './constant';
@Component({selector:'jms-cv-document',standalone:true,imports:[CommonModule,I18nModule,ImageFallbackDirective],templateUrl:'./cv-document.component.html',styleUrls:['./cv-document.component.css']})
export class CvDocumentComponent {
 readonly i18n=inject(I18nService); cv:CvDocument=normalizeCv({});
 @Input() set source(value:unknown) { this.cv=normalizeCv(value); }
 get theme() { return themeList[this.cv.theme]; }
 value(item:CvSectionItem,key:string):string { return String(item[key]??''); }
 date(value:string):string {
  if (!value) return '';
  // Historical CV DTO dates use MM/dd/yyyy; snapshot dates use ISO.
  const slash=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  const date=slash?new Date(Number(slash[3]),Number(slash[1])-1,Number(slash[2])):new Date(value);
  return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat(this.i18n.locale(),{dateStyle:'medium'}).format(date);
 }
}
