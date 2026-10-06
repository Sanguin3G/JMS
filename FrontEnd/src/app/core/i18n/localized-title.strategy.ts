import { Injectable, inject, effect } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18nService } from './i18n.service';
@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
 private readonly title = inject(Title);
 private readonly i18n = inject(I18nService);
 private base = 'JMS';
 constructor() { super(); effect(() => { this.i18n.language(); this.title.setTitle(this.i18n.t(this.base)); }); }
 override updateTitle(snapshot: RouterStateSnapshot): void { this.base = this.buildTitle(snapshot) || 'JMS'; this.title.setTitle(this.i18n.t(this.base)); }
}
