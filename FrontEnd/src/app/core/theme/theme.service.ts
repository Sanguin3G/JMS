import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

@Injectable({ providedIn: 'root' })
export class ThemeService {
   private readonly storageKey = 'jms-theme-mode';
   private readonly modeSubject = new BehaviorSubject<ThemeMode>(this.readMode());
   private readonly browser: boolean;
   private mediaQuery?: MediaQueryList;

   readonly mode$ = this.modeSubject.asObservable();

   constructor(
      @Inject(DOCUMENT) private readonly document: Document,
      @Inject(PLATFORM_ID) platformId: object,
   ) {
      this.browser = isPlatformBrowser(platformId);
      if (!this.browser) return;

      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
         if (this.mode === 'system') this.applyMode();
      });
      this.applyMode();
   }

   get mode(): ThemeMode {
      return this.modeSubject.value;
   }

   get resolvedMode(): ResolvedTheme {
      if (this.mode !== 'system') return this.mode;
      return this.mediaQuery?.matches ? 'dark' : 'light';
   }

   setMode(mode: ThemeMode) {
      if (this.mode === mode) {
         this.applyMode();
         return;
      }

      this.modeSubject.next(mode);
      if (this.browser) {
         try {
            localStorage.setItem(this.storageKey, mode);
         } catch {
            // The theme still applies when storage is unavailable.
         }
      }
      this.applyMode();
   }

   private applyMode() {
      if (!this.browser) return;
      const resolvedMode = this.resolvedMode;
      this.document.documentElement.dataset['theme'] = resolvedMode;
      this.document.documentElement.style.colorScheme = resolvedMode;
   }

   private readMode(): ThemeMode {
      if (typeof window === 'undefined') return 'system';
      try {
         const stored = localStorage.getItem(this.storageKey);
         return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
      } catch {
         return 'system';
      }
   }
}
