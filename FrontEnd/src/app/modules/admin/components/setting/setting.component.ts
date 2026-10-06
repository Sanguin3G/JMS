import { inject, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { apiAdmin, AuthorizationMode } from 'src/app/service/constant';
import { AiConnectionTestResult, AiModelCapability, AiProviderProfile, AiProviderProfileDraft } from 'src/app/core/models/ai.models';
import { CatalogAdminEntry, CatalogAdminRequest, CatalogAdminSnapshot, FaqEntry, FaqEntryRequest } from 'src/app/core/models/api.models';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';

type CatalogKind = 'categories' | 'levels' | 'employment-types';

interface CatalogPanel {
  kind: CatalogKind;
  title: string;
  description: string;
  entries: CatalogAdminEntry[];
  draft: CatalogAdminRequest;
}


@Component({
  standalone: false,
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class AdminSettingComponent implements OnInit {
   private readonly api = inject(ApiService);
  activeSection: 'ai' | 'catalogs' | 'help' = 'ai';
  actingProfileId: number | null = null;
  private readonly dialog = inject(Dialog);
  modelOptions: AiModelCapability[] = [];
  profiles: AiProviderProfile[] = [];
  editingProfileId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  testingProfileId: number | null = null;
  draft: AiProviderProfileDraft = this.createDraft();
  faqEntries: FaqEntry[] = [];
  faqEditingId: number | null = null;
  faqSaving = false;
  faqDraft: FaqEntryRequest = this.createFaqDraft();
  catalogSaving: CatalogKind | null = null;
  catalogPanels: CatalogPanel[] = [
    this.createCatalogPanel('categories', 'Ngành nghề', 'Danh mục dùng cho CV, công việc và matching.'),
    this.createCatalogPanel('levels', 'Cấp bậc', 'Cấp độ nghề nghiệp chung cho CV và yêu cầu tuyển dụng.'),
    this.createCatalogPanel('employment-types', 'Hình thức làm việc', 'Hình thức công việc và loại hợp đồng.'),
  ];

  constructor(private changeDetector: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const results = await Promise.allSettled([this.loadOptions(), this.loadProfiles(), this.loadFaqEntries(), this.loadCatalogs()]);
    if (results.some(result => result.status === 'rejected')) this.errorMessage = 'Một số cài đặt chưa tải được. Vui lòng tải lại trang.';
    this.isLoading = false;
    this.changeDetector.detectChanges();
  }

  get selectedModel(): AiModelCapability | undefined {
    return this.providerModels.find(option => option.modelId === this.draft.modelId);
  }

  get providers(): string[] { return [...new Set(this.modelOptions.map(model => model.provider))]; }
  get providerModels(): AiModelCapability[] { return this.modelOptions.filter(model => model.provider === this.draft.provider && model.supportsMatching); }
  get reasoningLabel(): string {
    switch (this.selectedModel?.reasoningControl) {
      case 'thinking-budget': return 'Ngân sách suy nghĩ';
      case 'reasoning-effort': return 'Mức độ suy luận';
      default: return 'Mức độ suy nghĩ';
    }
  }
  providerName(provider: string): string { return ({ gemini: 'Google Gemini', openai: 'OpenAI', anthropic: 'Anthropic' } as Record<string, string>)[provider] ?? provider; }
  reasoningName(level: string): string { return ({ disabled: 'Tắt', minimal: 'Tối thiểu', low: 'Thấp', medium: 'Vừa', high: 'Cao', 'budget-1024': '1.024 token' } as Record<string, string>)[level] ?? level; }
  onProviderChanged(): void {
    const model = this.providerModels[0];
    this.draft.modelId = model?.modelId ?? '';
    this.draft.reasoningLevel = model?.defaultReasoningLevel ?? '';
    this.draft.apiKey = '';
    this.draft.removeApiKey = false;
  }

  onModelChanged(): void {
    const model = this.selectedModel;
    if (model && !model.reasoningLevels.includes(this.draft.reasoningLevel)) {
      this.draft.reasoningLevel = model.defaultReasoningLevel;
    }
  }

  beginEditing(profile: AiProviderProfile): void {
    this.editingProfileId = profile.id;
    this.draft = {
      provider: profile.provider,
      displayName: profile.displayName,
      modelId: profile.modelId,
      reasoningLevel: profile.reasoningLevel,
      apiKey: '',
      removeApiKey: false,
      isEnabled: profile.isEnabled,
      isDefaultForMatching: profile.isDefaultForMatching,
      isEnabledForAssistant: false,
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.editingProfileId = null;
    this.draft = this.createDraft();
    this.draft.provider = this.providers[0] ?? '';
    if (this.modelOptions.length) this.onProviderChanged();
    this.errorMessage = '';
  }

  async save(): Promise<void> {
    if (this.isSaving) return;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.editingProfileId && !this.draft.apiKey.trim()) {
      this.errorMessage = 'Cấu hình mới cần khóa API. Khóa được bảo vệ trên máy chủ và không trả về trình duyệt.';
      return;
    }
    if (!this.selectedModel || !this.selectedModel.reasoningLevels.includes(this.draft.reasoningLevel)) {
      this.errorMessage = 'Vui lòng chọn mô hình và cấu hình suy luận được hỗ trợ.';
      return;
    }
    if (this.draft.removeApiKey && this.draft.apiKey.trim()) {
      this.errorMessage = 'Chọn thay khóa hoặc xóa khóa, không thực hiện cả hai.';
      return;
    }
    if (this.draft.removeApiKey && !await this.confirm('Xóa khóa API?', 'Cấu hình sẽ không được dùng cho matching đến khi có khóa mới.')) return;

    this.isSaving = true;
    try {
      const response = this.editingProfileId
        ? await this.api.putRequest<ApiResponse<AiProviderProfile>>(`${apiAdmin.AI_PROFILES}/${this.editingProfileId}`, AuthorizationMode.BEARER_TOKEN, this.draft)
        : await this.api.postRequest<ApiResponse<AiProviderProfile>>(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN, this.draft);

      if (response?.statusCode >= 200 && response?.statusCode < 300) {
        this.successMessage = 'Đã lưu cấu hình AI. Kết quả matching trước đây được giữ nguyên.';
        this.cancelEditing();
        await this.loadProfiles();
      } else {
        this.errorMessage = response?.message ?? 'Không thể lưu cấu hình AI.';
      }
    } catch {
      this.errorMessage = 'Không thể lưu cấu hình AI.';
    } finally {
      this.isSaving = false;
      this.changeDetector.detectChanges();
    }
  }

  async activateForMatching(profile: AiProviderProfile): Promise<void> {
    if (this.actingProfileId !== null) return;
    this.actingProfileId = profile.id;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const response = await this.api.postRequest<ApiResponse<string>>(`${apiAdmin.AI_PROFILES}/${profile.id}/activate-matching`, AuthorizationMode.BEARER_TOKEN, {});
      if (response?.statusCode >= 200 && response?.statusCode < 300) {
        this.successMessage = `Đã chọn ${profile.displayName} cho matching tiếp theo.`;
        await this.loadProfiles();
      } else {
        this.errorMessage = response?.message ?? 'Không thể kích hoạt cấu hình AI.';
      }
    } catch {
      this.errorMessage = 'Không thể kích hoạt cấu hình AI.';
    } finally {
      this.actingProfileId = null;
      this.changeDetector.detectChanges();
    }
  }

  async testConnection(profile: AiProviderProfile): Promise<void> {
    if (this.testingProfileId !== null) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.testingProfileId = profile.id;
    try {
      const response = await this.api.postRequest<ApiResponse<AiConnectionTestResult>>(`${apiAdmin.AI_PROFILES}/${profile.id}/test`, AuthorizationMode.BEARER_TOKEN, {});
      const result = response?.data;
      if (result?.success) {
        this.successMessage = `${profile.displayName}: ${result.status}`;
      } else {
        this.errorMessage = `${profile.displayName}: ${result?.status ?? response?.message ?? 'Kiểm tra kết nối thất bại.'}`;
      }
    } catch {
      this.errorMessage = 'Không thể hoàn tất kiểm tra kết nối.';
    } finally {
      this.testingProfileId = null;
      this.changeDetector.detectChanges();
    }
  }

  beginFaqEditing(entry: FaqEntry): void {
    this.faqEditingId = entry.id;
    this.faqDraft = {
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords ?? '',
      category: entry.category,
      isPublished: entry.isPublished !== false,
      sortOrder: entry.sortOrder ?? 0,
    };
  }

  cancelFaqEditing(): void {
    this.faqEditingId = null;
    this.faqDraft = this.createFaqDraft();
  }

  async saveFaq(): Promise<void> {
    if (this.faqSaving) return;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.faqDraft.question.trim() || !this.faqDraft.answer.trim()) {
      this.errorMessage = 'Vui lòng nhập câu hỏi và câu trả lời.';
      return;
    }

    this.faqSaving = true;
    const payload: FaqEntryRequest = {
      ...this.faqDraft,
      question: this.faqDraft.question.trim(),
      answer: this.faqDraft.answer.trim(),
      keywords: this.faqDraft.keywords.trim(),
      category: this.faqDraft.category.trim() || 'Hướng dẫn JMS',
    };
    try {
      const response = this.faqEditingId
        ? await this.api.putRequest<ApiResponse<FaqEntry>>(`${apiAdmin.FAQ}/${this.faqEditingId}`, AuthorizationMode.BEARER_TOKEN, payload)
        : await this.api.postRequest<ApiResponse<FaqEntry>>(apiAdmin.FAQ, AuthorizationMode.BEARER_TOKEN, payload);
      if (response?.statusCode >= 200 && response.statusCode < 300) {
        this.successMessage = 'Đã lưu câu hỏi. Nội dung trợ giúp được cập nhật ngay.';
        this.cancelFaqEditing();
        await this.loadFaqEntries();
      } else {
        this.errorMessage = response?.message ?? 'Không thể lưu câu hỏi.';
      }
    } catch {
      this.errorMessage = 'Không thể lưu câu hỏi.';
    } finally {
      this.faqSaving = false;
      this.changeDetector.detectChanges();
    }
  }

  async deleteFaq(entry: FaqEntry): Promise<void> {
    if (!await this.confirm('Xóa câu hỏi?', `Xóa “${entry.question}” khỏi nội dung trợ giúp?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.api.deleteRequest<ApiResponse<string>>(`${apiAdmin.FAQ}/${entry.id}`, AuthorizationMode.BEARER_TOKEN);
      this.successMessage = 'Đã xóa câu hỏi.';
      await this.loadFaqEntries();
    } catch {
      this.errorMessage = 'Không thể xóa câu hỏi.';
    }
  }

  async saveCatalog(panel: CatalogPanel): Promise<void> {
    if (this.catalogSaving !== null) return;
    const name = panel.draft.name.trim();
    if (!name) {
      this.errorMessage = `Vui lòng nhập tên ${panel.title.toLowerCase()}.`;
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.catalogSaving = panel.kind;
    const payload: CatalogAdminRequest = {
      name,
      description: panel.draft.description?.trim() || null,
    };
    try {
      const response = await this.api.postRequest<ApiResponse<CatalogAdminEntry>>(`${apiAdmin.CATALOGS}/${panel.kind}`, AuthorizationMode.BEARER_TOKEN, payload);
      if (response?.statusCode >= 200 && response.statusCode < 300) {
        this.successMessage = `Đã thêm danh mục ${panel.title.toLowerCase()}.`;
        panel.draft = { name: '', description: '' };
        await this.loadCatalogs();
      } else {
        this.errorMessage = response?.message ?? `Không thể lưu danh mục ${panel.title.toLowerCase()}.`;
      }
    } catch {
      this.errorMessage = `Không thể lưu danh mục ${panel.title.toLowerCase()}.`;
    } finally {
      this.catalogSaving = null;
      this.changeDetector.detectChanges();
    }
  }

  async deleteCatalog(panel: CatalogPanel, entry: CatalogAdminEntry): Promise<void> {
    if (!await this.confirm('Lưu trữ danh mục?', `Ẩn “${entry.name}” khỏi biểu mẫu mới? CV và công việc trước đây vẫn giữ tham chiếu.`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.api.deleteRequest<ApiResponse<string>>(`${apiAdmin.CATALOGS}/${panel.kind}/${entry.id}`, AuthorizationMode.BEARER_TOKEN);
      this.successMessage = `Đã lưu trữ danh mục ${panel.title.toLowerCase()}.`;
      await this.loadCatalogs();
    } catch {
      this.errorMessage = `Không thể lưu trữ danh mục ${panel.title.toLowerCase()}.`;
    }
  }

  private async loadOptions(): Promise<void> {
    const response = await this.api.getRequest<AiModelCapability[]>(apiAdmin.AI_CAPABILITIES, AuthorizationMode.BEARER_TOKEN);
    this.modelOptions = Array.isArray(response) ? response : [];
    if (!this.providers.includes(this.draft.provider)) this.draft.provider = this.providers[0] ?? '';
    this.onProviderChanged();
  }

  private async loadProfiles(): Promise<void> {
    const response = await this.api.getRequest<ApiResponse<AiProviderProfile[]>>(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN);
    this.profiles = response?.data ?? [];
  }

  private async loadFaqEntries(): Promise<void> {
    const response = await this.api.getRequest<ApiResponse<FaqEntry[]>>(apiAdmin.FAQ, AuthorizationMode.BEARER_TOKEN);
    this.faqEntries = response?.data ?? [];
  }

  private async loadCatalogs(): Promise<void> {
    const response = await this.api.getRequest<ApiResponse<CatalogAdminSnapshot>>(apiAdmin.CATALOGS, AuthorizationMode.BEARER_TOKEN);
    const snapshot = response?.data;
    if (!snapshot) return;
    this.catalogPanels[0].entries = snapshot.categories ?? [];
    this.catalogPanels[1].entries = snapshot.levels ?? [];
    this.catalogPanels[2].entries = snapshot.employmentTypes ?? [];
  }

  private createDraft(): AiProviderProfileDraft {
    return {
      provider: '',
      displayName: '',
      modelId: '',
      reasoningLevel: '',
      apiKey: '',
      removeApiKey: false,
      isEnabled: true,
      isDefaultForMatching: false,
      isEnabledForAssistant: false,
    };
  }

  private createFaqDraft(): FaqEntryRequest {
    return {
      question: '',
      answer: '',
      keywords: '',
      category: 'Hướng dẫn JMS',
      isPublished: true,
      sortOrder: 0,
    };
  }

  private createCatalogPanel(kind: CatalogKind, title: string, description: string): CatalogPanel {
    return { kind, title, description, entries: [], draft: { name: '', description: '' } };
  }

  private async confirm(title: string, content: string): Promise<boolean> {
    return await firstValueFrom(this.dialog.open<boolean>(ConfirmDialogComponent, { ariaLabelledBy: "confirm-title", ariaDescribedBy: "confirm-message", width: '420px', maxWidth: '95vw', data: { title, content } }).closed) === true;
  }

}
