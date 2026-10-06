import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
   let service: ThemeService;

   beforeEach(() => {
      localStorage.removeItem('jms-theme-mode');
      document.documentElement.removeAttribute('data-theme');
      TestBed.configureTestingModule({ providers: [ThemeService] });
      service = TestBed.inject(ThemeService);
   });

   it('starts in system mode when no preference is saved', () => {
      expect(service.mode).toBe('system');
      expect(document.documentElement.dataset['theme']).toMatch(/^(light|dark)$/);
   });

   it('persists explicit light and dark preferences', () => {
      service.setMode('dark');
      expect(service.mode).toBe('dark');
      expect(localStorage.getItem('jms-theme-mode')).toBe('dark');
      expect(document.documentElement.dataset['theme']).toBe('dark');

      service.setMode('light');
      expect(service.mode).toBe('light');
      expect(localStorage.getItem('jms-theme-mode')).toBe('light');
      expect(document.documentElement.dataset['theme']).toBe('light');
   });
});
