import {Component,Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {I18nModule} from 'src/app/core/i18n/i18n.module';
import {JobDetail} from 'src/app/core/models/api.models';
@Component({selector:'jms-job-document',standalone:true,imports:[CommonModule,I18nModule],templateUrl:'./job-document.component.html',styleUrls:['./job-document.component.css']})
export class JobDocumentComponent {@Input({required:true})job!:JobDetail;}
