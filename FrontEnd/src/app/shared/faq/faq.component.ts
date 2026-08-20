import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse, getRequest, postRequest } from 'src/app/service/api-requests';
import { apiPublic, AuthorizationMode } from 'src/app/service/constant';
import { FaqChatResponse, FaqEntry } from 'src/app/core/models/api.models';

@Component({
   standalone: false,
   selector: 'app-faq',
   templateUrl: './faq.component.html',
   styleUrls: ['./faq.component.css']
})
export class FaqComponent {
   query = '';
   question = '';
   entries: FaqEntry[] = [];
   answer = '';
   answerSource = '';
   isLoading = false;
   isAsking = false;

   constructor(private changeDetector: ChangeDetectorRef) {
      this.search();
   }

   search(): void {
      this.isLoading = true;
      getRequest<ApiResponse<FaqEntry[]>>(apiPublic.FAQ, AuthorizationMode.PUBLIC, { query: this.query.trim() })
         .then(response => {
            this.entries = response.data ?? [];
         })
         .catch(() => {
            this.entries = [];
         })
         .finally(() => {
            this.isLoading = false;
            this.changeDetector.detectChanges();
         });
   }

   ask(): void {
      const message = this.question.trim();
      if (!message || this.isAsking) return;
      this.isAsking = true;
      postRequest<ApiResponse<FaqChatResponse>>(apiPublic.FAQ_CHAT, AuthorizationMode.PUBLIC, { message })
         .then(response => {
            this.answer = response.data?.answer ?? 'The JMS help notes did not return an answer.';
            this.answerSource = response.data?.aiAvailable ? 'Gemini assistant' : 'Curated JMS help';
         })
         .catch(() => {
            this.answer = 'The help service is unavailable right now. Browse the curated questions below.';
            this.answerSource = 'Offline fallback';
         })
         .finally(() => {
            this.isAsking = false;
            this.changeDetector.detectChanges();
         });
   }
}
