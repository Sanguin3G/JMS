import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';
describe('language preference',()=>{
 beforeEach(()=>{localStorage.clear();TestBed.resetTestingModule();});
 it('defaults to Vietnamese, persists English and leaves authored content intact',()=>{
  const language=TestBed.inject(I18nService);expect(language.t('Đăng nhập')).toBe('Đăng nhập');
  language.setLanguage('en');expect(language.t('Đăng nhập')).toBe('Sign in');
  expect(localStorage.getItem('jms-language')).toBe('en');
  expect(language.t('My original CV statement')).toBe('My original CV statement');
  expect(language.bilingual({vi:'Một chuyện để kể',en:'A story worth telling'})).toBe('A story worth telling');
  language.setLanguage('vi');expect(language.locale()).toBe('vi-VN');
 });
});
