import { Component } from '@angular/core';
import { ThemeMode, ThemeService } from 'src/app/core/theme/theme.service';
@Component({ standalone: false, selector: 'app-theme-toggle', templateUrl: './theme-toggle.component.html', styleUrls: ['./theme-toggle.component.css'] })
export class ThemeToggleComponent {
  readonly modes: { value: ThemeMode; label: string; icon: string; description: string }[] = [
    { value: 'system', label: 'Hệ thống', icon: 'bi-display', description: 'Theo giao diện thiết bị' },
    { value: 'light', label: 'Sáng', icon: 'bi-sun', description: 'Rõ ràng, nhiều ánh sáng' },
    { value: 'dark', label: 'Tối', icon: 'bi-moon-stars', description: 'Dịu mắt trong không gian tối' },
  ];
  constructor(readonly theme: ThemeService) {}
  get selected() { return this.modes.find(mode => mode.value === this.theme.mode)!; }
  selectMode(mode: ThemeMode): void { this.theme.setMode(mode); }
}
