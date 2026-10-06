import { inject, ChangeDetectorRef, Component } from '@angular/core';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { apiPublic, AuthorizationMode } from 'src/app/service/constant';
import { FaqChatResponse, FaqEntry } from 'src/app/core/models/api.models';

@Component({
   standalone: false,
   selector: 'app-faq',
   templateUrl: './faq.component.html',
   styleUrls: ['./faq.component.css']
})
export class FaqComponent {
   private readonly api = inject(ApiService);
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
      this.api.getRequest<ApiResponse<FaqEntry[]>>(apiPublic.FAQ, AuthorizationMode.PUBLIC, { query: this.query.trim() })
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
      this.api.postRequest<ApiResponse<FaqChatResponse>>(apiPublic.FAQ_CHAT, AuthorizationMode.PUBLIC, { message })
         .then(response => {
            this.answer = response.data?.answer ?? 'Chưa tìm thấy hướng dẫn phù hợp.';
            this.answerSource = response.data?.aiAvailable ? 'Trợ giúp JMS' : 'Hướng dẫn JMS';
         })
         .catch(() => {
            this.answer = 'Chưa thể tìm câu trả lời. Xem các hướng dẫn bên dưới.';
            this.answerSource = 'Hướng dẫn ngoại tuyến';
         })
         .finally(() => {
            this.isAsking = false;
            this.changeDetector.detectChanges();
         });
   }
}
