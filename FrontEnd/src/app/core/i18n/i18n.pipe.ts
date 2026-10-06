import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';
@Pipe({name:'t',standalone:true,pure:false})
export class I18nPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: unknown, params?: Record<string, unknown>): string { return this.i18n.t(value, params); }
}
