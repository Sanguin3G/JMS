import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {I18nModule} from 'src/app/core/i18n/i18n.module';
import { inject, effect, ChangeDetectorRef, Component } from '@angular/core';
import { I18nService } from 'src/app/core/i18n/i18n.service';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { apiPublic, AuthorizationMode } from 'src/app/service/constant';
import { FaqChatResponse, FaqEntry } from 'src/app/core/models/api.models';

@Component({
   standalone: true,
   imports:[CommonModule,FormsModule,I18nModule],
   selector: 'app-faq',
   templateUrl: './faq.component.html',
   styleUrls: ['./faq.component.css']
})
export class FaqComponent {
   private readonly api = inject(ApiService);
   readonly i18n = inject(I18nService);
   error = '';
   private searchVersion = 0;
   query = '';
   question = '';
   entries: FaqEntry[] = [];
   answer = '';
   answerSource = '';
   isLoading = false;
   isAsking = false;

   constructor(private changeDetector: ChangeDetectorRef) {
      effect(() => { this.i18n.language(); this.answer = ''; this.answerSource = ''; });
      this.search();
   }

   search(): void {
      const version = ++this.searchVersion;
      this.error = '';
      this.isLoading = true;
      this.api.getRequest<ApiResponse<FaqEntry[]>>(apiPublic.FAQ, AuthorizationMode.PUBLIC, { query: this.query.trim() })
         .then(response => {
            if (version !== this.searchVersion) return;
            this.entries = response.data ?? [];
         })
         .catch(() => {
            if (version !== this.searchVersion) return;
            this.entries = [];
            this.error = 'Không thể tải trợ giúp. Vui lòng thử lại.';
         })
         .finally(() => {
            if (version !== this.searchVersion) return;
            this.isLoading = false;
            this.changeDetector.detectChanges();
         });
   }

   ask(): void {
      const message = this.question.trim();
      const language = this.i18n.language();
      if (!message || this.isAsking) return;
      this.isAsking = true;
      this.api.postRequest<ApiResponse<FaqChatResponse>>(apiPublic.FAQ_CHAT, AuthorizationMode.PUBLIC, { message, language })
         .then(response => {
            if (language !== this.i18n.language()) return;
            this.answer = response.data?.answer ?? 'Chưa tìm thấy hướng dẫn phù hợp.';
            this.answerSource = response.data?.source === 'curated-faq-vi' ? 'Nội dung gốc tiếng Việt' : 'Hướng dẫn JMS';
         })
         .catch(() => {
            if (language !== this.i18n.language()) return;
            this.answer = 'Chưa thể tìm câu trả lời. Xem các hướng dẫn bên dưới.';
            this.answerSource = 'Hướng dẫn ngoại tuyến';
         })
         .finally(() => {
            this.isAsking = false;
            this.changeDetector.detectChanges();
         });
   }

   entryQuestion(entry: FaqEntry): string { return this.i18n.language() === 'en' ? entry.questionEn || entry.question : entry.question; }
   entryAnswer(entry: FaqEntry): string { return this.i18n.language() === 'en' ? entry.answerEn || entry.answer : entry.answer; }
}
