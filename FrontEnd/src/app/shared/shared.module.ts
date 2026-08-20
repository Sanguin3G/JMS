import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { FaqComponent } from './faq/faq.component';

@NgModule({
   declarations: [ThemeToggleComponent, FaqComponent],
   imports: [CommonModule, FormsModule],
   exports: [ThemeToggleComponent, FaqComponent],
})
export class SharedModule {}
