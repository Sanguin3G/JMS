import { NgModule } from '@angular/core';
import { I18nPipe } from './i18n.pipe';
import { LanguageSwitcherComponent } from './language-switcher.component';
@NgModule({imports:[I18nPipe,LanguageSwitcherComponent],exports:[I18nPipe,LanguageSwitcherComponent]})
export class I18nModule {}

