import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal, effect } from '@angular/core';
import { EN } from './translations';
export type Language = 'vi' | 'en';
@Injectable({providedIn:'root'})
export class I18nService {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>(this.read());
  readonly locale = () => this.language() === 'vi' ? 'vi-VN' : 'en-GB';
  constructor() { effect(() => { this.document.documentElement.lang = this.language(); }); }
  setLanguage(value: Language): void { this.language.set(value); try { localStorage.setItem('jms-language', value); } catch {} }
  t(value: unknown, params: Record<string, unknown> = {}): string {
    const key = String(value ?? '');
    const text = this.language() === 'en' ? (EN[key] ?? key) : key;
    return text.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match);
  }
  bilingual(value: {vi:string;en:string}): string { return value[this.language()]; }
  private read(): Language { try { return localStorage.getItem('jms-language') === 'en' ? 'en' : 'vi'; } catch { return 'vi'; } }
}
