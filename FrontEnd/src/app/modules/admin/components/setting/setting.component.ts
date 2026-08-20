import { Component, OnInit } from '@angular/core';
import { ApiResponse, deleteRequest, getRequest, postRequest, putRequest } from 'src/app/service/api-requests';
import { apiAdmin, AuthorizationMode } from 'src/app/service/constant';
import { AiConnectionTestResult, AiModelCapability, AiProviderProfile, AiProviderProfileDraft } from 'src/app/core/models/ai.models';
import { FaqEntry, FaqEntryRequest } from 'src/app/core/models/api.models';


@Component({
  standalone: false,
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class AdminSettingComponent implements OnInit {
  readonly defaultModelId = 'gemini-3.1-flash-lite';
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

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadOptions(), this.loadProfiles(), this.loadFaqEntries()]);
    this.isLoading = false;
  }

  get selectedModel(): AiModelCapability | undefined {
    return this.modelOptions.find(option => option.modelId === this.draft.modelId);
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
      isEnabled: profile.isEnabled,
      isDefaultForMatching: profile.isDefaultForMatching,
      isEnabledForAssistant: profile.isEnabledForAssistant,
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.editingProfileId = null;
    this.draft = this.createDraft();
    this.errorMessage = '';
  }

  async save(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.editingProfileId && !this.draft.apiKey.trim()) {
      this.errorMessage = 'An API key is required for a new profile. It is never returned after saving.';
      return;
    }

    this.isSaving = true;
    try {
      const response = this.editingProfileId
        ? await putRequest<ApiResponse<AiProviderProfile>>(`${apiAdmin.AI_PROFILES}/${this.editingProfileId}`, AuthorizationMode.BEARER_TOKEN, this.draft)
        : await postRequest<ApiResponse<AiProviderProfile>>(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN, this.draft);

      if (response?.statusCode >= 200 && response?.statusCode < 300) {
        this.successMessage = 'Provider profile saved. Existing match records are unchanged.';
        this.cancelEditing();
        await this.loadProfiles();
      } else {
        this.errorMessage = response?.message ?? 'The provider profile could not be saved.';
      }
    } catch {
      this.errorMessage = 'The provider profile could not be saved.';
    } finally {
      this.isSaving = false;
    }
  }

  async activateForMatching(profile: AiProviderProfile): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const response = await postRequest<ApiResponse<string>>(`${apiAdmin.AI_PROFILES}/${profile.id}/activate-matching`, AuthorizationMode.BEARER_TOKEN, {});
      if (response?.statusCode >= 200 && response?.statusCode < 300) {
        this.successMessage = `${profile.displayName} will be used for future matching runs.`;
        await this.loadProfiles();
      } else {
        this.errorMessage = response?.message ?? 'The provider profile could not be activated.';
      }
    } catch {
      this.errorMessage = 'The provider profile could not be activated.';
    }
  }

  async testConnection(profile: AiProviderProfile): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.testingProfileId = profile.id;
    try {
      const response = await postRequest<ApiResponse<AiConnectionTestResult>>(`${apiAdmin.AI_PROFILES}/${profile.id}/test`, AuthorizationMode.BEARER_TOKEN, {});
      const result = response?.data;
      if (result?.success) {
        this.successMessage = `${profile.displayName}: ${result.status}`;
      } else {
        this.errorMessage = `${profile.displayName}: ${result?.status ?? response?.message ?? 'Connection test failed.'}`;
      }
    } catch {
      this.errorMessage = 'The connection test could not be completed.';
    } finally {
      this.testingProfileId = null;
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
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.faqDraft.question.trim() || !this.faqDraft.answer.trim()) {
      this.errorMessage = 'FAQ question and answer are required.';
      return;
    }

    this.faqSaving = true;
    const payload: FaqEntryRequest = {
      ...this.faqDraft,
      question: this.faqDraft.question.trim(),
      answer: this.faqDraft.answer.trim(),
      keywords: this.faqDraft.keywords.trim(),
      category: this.faqDraft.category.trim() || 'JMS basics',
    };
    try {
      const response = this.faqEditingId
        ? await putRequest<ApiResponse<FaqEntry>>(`${apiAdmin.FAQ}/${this.faqEditingId}`, AuthorizationMode.BEARER_TOKEN, payload)
        : await postRequest<ApiResponse<FaqEntry>>(apiAdmin.FAQ, AuthorizationMode.BEARER_TOKEN, payload);
      if (response?.statusCode >= 200 && response.statusCode < 300) {
        this.successMessage = 'FAQ entry saved. Public answers use the curated content immediately.';
        this.cancelFaqEditing();
        await this.loadFaqEntries();
      } else {
        this.errorMessage = response?.message ?? 'The FAQ entry could not be saved.';
      }
    } catch {
      this.errorMessage = 'The FAQ entry could not be saved.';
    } finally {
      this.faqSaving = false;
    }
  }

  async deleteFaq(entry: FaqEntry): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm(`Delete “${entry.question}”?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await deleteRequest<ApiResponse<string>>(`${apiAdmin.FAQ}/${entry.id}`, AuthorizationMode.BEARER_TOKEN);
      this.successMessage = 'FAQ entry deleted.';
      await this.loadFaqEntries();
    } catch {
      this.errorMessage = 'The FAQ entry could not be deleted.';
    }
  }

  private async loadOptions(): Promise<void> {
    const response = await getRequest<AiModelCapability[]>(apiAdmin.AI_CAPABILITIES, AuthorizationMode.BEARER_TOKEN);
    this.modelOptions = Array.isArray(response) ? response : [];
    if (!this.modelOptions.some(option => option.modelId === this.draft.modelId)) {
      this.draft.modelId = this.modelOptions[0]?.modelId ?? this.defaultModelId;
      this.onModelChanged();
    }
  }

  private async loadProfiles(): Promise<void> {
    const response = await getRequest<ApiResponse<AiProviderProfile[]>>(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN);
    this.profiles = response?.data ?? [];
  }

  private async loadFaqEntries(): Promise<void> {
    const response = await getRequest<ApiResponse<FaqEntry[]>>(apiAdmin.FAQ, AuthorizationMode.BEARER_TOKEN);
    this.faqEntries = response?.data ?? [];
  }

  private createDraft(): AiProviderProfileDraft {
    return {
      provider: 'gemini',
      displayName: 'Gemini development profile',
      modelId: this.defaultModelId,
      reasoningLevel: 'minimal',
      apiKey: '',
      isEnabled: true,
      isDefaultForMatching: true,
      isEnabledForAssistant: false,
    };
  }

  private createFaqDraft(): FaqEntryRequest {
    return {
      question: '',
      answer: '',
      keywords: '',
      category: 'JMS basics',
      isPublished: true,
      sortOrder: 0,
    };
  }

}
