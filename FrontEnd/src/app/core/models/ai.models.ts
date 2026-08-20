export interface AiModelCapability {
   provider: string;
   modelId: string;
   label: string;
   defaultReasoningLevel: string;
   reasoningLevels: string[];
   supportsMatching: boolean;
   supportsAssistant: boolean;
}

export interface AiProviderProfile {
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

export interface AiProviderProfileDraft {
   provider: string;
   displayName: string;
   modelId: string;
   reasoningLevel: string;
   apiKey: string;
   isEnabled: boolean;
   isDefaultForMatching: boolean;
   isEnabledForAssistant: boolean;
}
