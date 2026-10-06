import {Component,inject} from '@angular/core';
import {DialogRef} from '@angular/cdk/dialog';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {I18nModule} from 'src/app/core/i18n/i18n.module';
import {FaqComponent} from '../faq/faq.component';
@Component({selector:'jms-help-drawer',standalone:true,imports:[CommonModule,FormsModule,I18nModule,FaqComponent],template:`<section class="help-drawer" aria-labelledby="help-heading"><header><div><p>JMS · {{'Trợ giúp' | t}}</p><h1 id="help-heading">{{'Bạn đang cần gì?' | t}}</h1></div><button type="button" (click)="ref.close()" [attr.aria-label]="'Đóng trợ giúp' | t"><i class="bi bi-x-lg" aria-hidden="true"></i></button></header><div class="help-body"><p class="help-intro">{{'Tìm hướng dẫn hoặc đặt câu hỏi ngắn. Câu trả lời đến từ nội dung được quản trị viên biên soạn.' | t}}</p><app-faq></app-faq></div></section>`,styles:[`.help-drawer{height:100%;display:flex;flex-direction:column;color:var(--text-color);background:var(--surface-color)}header{padding:1.5rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;gap:1rem;background:linear-gradient(125deg,var(--accent-soft),var(--surface-color))}header p{font-size:.75rem;color:var(--accent-color)}h1{font-size:1.6rem;margin:0}header button{width:42px;height:42px;flex-shrink:0;border:1px solid var(--border-color);border-radius:11px;background:var(--surface-color);color:var(--text-color)}.help-body{padding:1.5rem;overflow:auto;min-height:0}.help-intro{color:var(--muted-text-color);line-height:1.7}button:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}`]})
export class HelpDrawerComponent{readonly ref=inject(DialogRef);}

