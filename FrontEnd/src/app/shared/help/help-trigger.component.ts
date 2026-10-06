import {Component,inject} from '@angular/core';
import {I18nModule} from 'src/app/core/i18n/i18n.module';
import {HelpService} from './help.service';
@Component({selector:'jms-help-trigger',standalone:true,imports:[I18nModule],template:`<button type="button" class="help-trigger" (click)="help.open()" [attr.aria-label]="'Trợ giúp JMS' | t"><i class="bi bi-question-circle" aria-hidden="true"></i><span>{{'Trợ giúp' | t}}</span></button>`,styles:[`.help-trigger{height:42px;padding:.6rem .7rem;border:1px solid var(--border-color);border-radius:11px;background:var(--accent-soft);color:var(--accent-color);font-size:.8rem;font-weight:650;display:flex;align-items:center;gap:.45rem}.help-trigger:hover{box-shadow:0 4px 10px #4565c52e}.help-trigger:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}@media(max-width:1500px){.help-trigger span{display:none}}`]})
export class HelpTriggerComponent{readonly help=inject(HelpService);}
