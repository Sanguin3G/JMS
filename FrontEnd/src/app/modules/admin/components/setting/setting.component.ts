import { Component, OnInit } from '@angular/core';
import { getRequest, postRequest, putRequest } from 'src/app/service/api-requests';
import { apiAdmin, AuthorizationMode } from 'src/app/service/constant';

interface GeminiModelOption {
  modelId: string;
  label: string;
  defaultReasoningLevel: string;
  reasoningLevels: string[];
}

interface AiProviderProfile {
  id: number;
  provider: string;
  displayName: string;
  modelId: string;
  reasoningLevel: string;
  isEnabled: boolean;
  isDefaultForMatching: boolean;
  isEnabledForAssistant: boolean;
  hasApiKey: boolean;
  updatedAt: string;
}

interface ProfileDraft {
  displayName: string;
  modelId: string;
  reasoningLevel: string;
  apiKey: string;
  isEnabled: boolean;
  isDefaultForMatching: boolean;
  isEnabledForAssistant: boolean;
}

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class AdminSettingComponent implements OnInit {
  readonly defaultModelId = 'gemini-3.5-flash-lite';
  modelOptions: GeminiModelOption[] = [];
  profiles: AiProviderProfile[] = [];
  editingProfileId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  draft: ProfileDraft = this.createDraft();

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadOptions(), this.loadProfiles()]);
    this.isLoading = false;
  }

  get selectedModel(): GeminiModelOption | undefined {
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
        ? await putRequest(`${apiAdmin.AI_PROFILES}/${this.editingProfileId}`, AuthorizationMode.BEARER_TOKEN, this.draft)
        : await postRequest(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN, this.draft);

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
      const response = await postRequest(`${apiAdmin.AI_PROFILES}/${profile.id}/activate-matching`, AuthorizationMode.BEARER_TOKEN, {});
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

  private async loadOptions(): Promise<void> {
    const response = await getRequest(apiAdmin.GET_GEMINI_OPTIONS, AuthorizationMode.BEARER_TOKEN);
    this.modelOptions = Array.isArray(response) ? response : [];
    if (!this.modelOptions.some(option => option.modelId === this.draft.modelId)) {
      this.draft.modelId = this.modelOptions[0]?.modelId ?? this.defaultModelId;
      this.onModelChanged();
    }
  }

  private async loadProfiles(): Promise<void> {
    const response = await getRequest(apiAdmin.AI_PROFILES, AuthorizationMode.BEARER_TOKEN);
    this.profiles = response?.data ?? [];
  }

  private createDraft(): ProfileDraft {
    return {
      displayName: 'Gemini development profile',
      modelId: this.defaultModelId,
      reasoningLevel: 'minimal',
      apiKey: '',
      isEnabled: true,
      isDefaultForMatching: true,
      isEnabledForAssistant: false,
    };
  }

}
