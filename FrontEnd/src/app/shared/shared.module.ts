import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';

@NgModule({
   declarations: [ThemeToggleComponent],
   imports: [CommonModule],
   exports: [ThemeToggleComponent],
})
export class SharedModule {}
