import { JobDocumentComponent } from './job-document/job-document.component';
import { HelpTriggerComponent } from './help/help-trigger.component';
import { I18nModule } from 'src/app/core/i18n/i18n.module';
import { CvDocumentComponent } from './cv-viewer/cv-document.component';
import { ImageFallbackDirective } from './image-fallback/image-fallback.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { FaqComponent } from './faq/faq.component';
import { ViewCvComponent } from './cv-viewer/view-cv.component';
import { DialogModule } from '@angular/cdk/dialog';
import { CdkMenuModule } from '@angular/cdk/menu';
import { AccountMenuComponent } from './account-menu/account-menu.component';

@NgModule({
   declarations: [ThemeToggleComponent, ViewCvComponent],
   imports: [JobDocumentComponent, HelpTriggerComponent, FaqComponent, I18nModule, CvDocumentComponent, AccountMenuComponent, CdkMenuModule, ImageFallbackDirective, CommonModule, FormsModule, DialogModule],
   exports: [JobDocumentComponent, HelpTriggerComponent, FaqComponent, I18nModule, CvDocumentComponent, AccountMenuComponent, ImageFallbackDirective, ThemeToggleComponent, ViewCvComponent],
})
export class SharedModule {}
