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
   declarations: [ThemeToggleComponent, FaqComponent, ViewCvComponent],
   imports: [AccountMenuComponent, CdkMenuModule, ImageFallbackDirective, CommonModule, FormsModule, DialogModule],
   exports: [AccountMenuComponent, ImageFallbackDirective, ThemeToggleComponent, FaqComponent, ViewCvComponent],
})
export class SharedModule {}
