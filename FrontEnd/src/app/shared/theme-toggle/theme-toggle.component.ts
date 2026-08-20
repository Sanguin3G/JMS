import { Component } from '@angular/core';
import { ThemeMode, ThemeService } from 'src/app/core/theme/theme.service';

@Component({
   standalone: false,
   selector: 'app-theme-toggle',
   templateUrl: './theme-toggle.component.html',
   styleUrls: ['./theme-toggle.component.css'],
})
export class ThemeToggleComponent {
   readonly modes: { value: ThemeMode; label: string }[] = [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
   ];

   constructor(readonly theme: ThemeService) {}

   selectMode(mode: ThemeMode) {
      this.theme.setMode(mode);
   }
}
