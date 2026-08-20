import { ApiResponse } from 'src/app/service/api-requests';

export type ApiEnvelope<T> = ApiResponse<T>;

export interface CatalogItem {
   id: number;
   title?: string;
   categoryName?: string;
   name?: string;
}

export interface UserProfile {
   id: number;
   userName?: string;
   fullName?: string;
   email?: string;
   phoneNumber?: string;
   dob?: string;
   avatarURL?: string;
   companyId?: number | null;
}

export interface LoginRequest {
   username: string;
   password: string;
}

export interface CvSkill {
   title: string;
   skillDescription: string;
}

export interface CvCertificate {
   certificateName: string;
   certificateProvider: string;
   issuedDate: string;
   expiredDate: string;
   credentialURL: string;
}

export interface CvAward {
   fromYear: string;
   awardName: string;
   description: string;
}

export interface CvExperience {
   ComapanyName: string;
   position: string;
   fromDate: string;
   toDate: string;
   description: string;
   employmentTypeName: string;
}

export interface CvProject {
   projectName: string;
   fromDate: string;
   toDate: string;
   description: string;
   isStillWorking: boolean;
}

export interface CvEducation {
   schoolName: string;
   majorName: string;
   description: string;
   fromYear: string;
   toYear: string;
   stillLearning: boolean;
}

export interface CurriculumVitaePayload {
   id: number;
   candidateId: number;
   careerGoal: string;
   employmentTypeName: string;
   phone: string;
   displayName: string;
   genderDisplay: string;
   displayEmail: string;
   address: string;
   dob: string;
   jobExperiences: CvExperience[];
   skills: CvSkill[];
   educations: CvEducation[];
   projects: CvProject[];
   certificates: CvCertificate[];
   awards: CvAward[];
   avatarURL: string | null;
   categoryName: string;
   categoryId: string;
   genderId: string;
   isFindingJob: boolean;
   levelTitle: string;
   cvTitle: string;
   theme: number;
   font: string;
}

export interface CurriculumVitae {
   id: number;
   careerGoal?: string;
   displayEmail?: string;
   phone?: string;
   dob?: string;
   genderId?: number;
   address?: string;
   displayName?: string;
   cvTitle?: string;
   categoryName?: string;
   categoryId?: number;
   levelTitle?: string;
   levelId?: number;
   employmentTypeName?: string;
   employmentTypeId?: number;
   jobExperiences?: CvExperience[];
   skills?: CvSkill[];
   educations?: CvEducation[];
   projects?: CvProject[];
   certificates?: CvCertificate[];
   awards?: CvAward[];
   theme?: number;
   font?: string;
   avatarURL?: string;
}

export interface JobSummary {
   jobId: number;
   title: string;
   companyName?: string;
   salary?: string;
   address?: string;
   categoryName?: string;
   levelTitle?: string;
   employmentTypeName?: string;
   expiredDate?: string;
   isExpired?: boolean;
   positionTitle?: string;
   createdAt?: string;
   numberRequirement?: number | null;
   companyDTO?: CompanySummary;
   categoryId?: number | null;
   levelId?: number | null;
   employmentTypeId?: number | null;
}

export interface CompanySummary {
   companyId?: number;
   companyName?: string;
   recuirterFounder?: string;
   avatarURL?: string;
   description?: string;
   yearOfEstablishment?: string | number;
   size?: string;
   webURL?: string;
}

export interface JobDetail extends JobSummary {
   recuirterId?: number | null;
   genderRequirement?: string;
   ageRequirement?: string;
   educationRequirement?: string;
   jobDetail?: string;
   experienceRequirement?: string;
   projectRequirement?: string;
   skillRequirement?: string;
   certificateRequirement?: string;
   otherInformation?: string;
   candidateBenefit?: string;
   contactEmail?: string;
}

export interface MatchingExplanation {
   provider?: string;
   model?: string;
   status?: string;
   score?: number | null;
   skillScore?: number | null;
   experienceScore?: number | null;
   educationScore?: number | null;
   summary?: string;
   strengths?: string[];
   gaps?: string[];
   failureReason?: string | null;
   deterministicScore?: number | null;
   deterministicSkillScore?: number | null;
   deterministicExperienceScore?: number | null;
   deterministicEducationScore?: number | null;
   deterministicProjectAndCertificateScore?: number | null;
   eligibilityStatus?: string;
   eligibilityReason?: string | null;
   rulesVersion?: string;
}

export interface MatchingRecord {
   id: number;
   candidateId?: number;
   jobDescriptionId?: number;
   percentMatching?: number;
   jsonMatching?: string | MatchingExplanation | null;
   matchingInsight?: MatchingExplanation | null;
   matchingRulesVersion?: string;
   matchingProvider?: string;
   matchingModel?: string;
   matchingStatus?: string;
   matchingEligibilityStatus?: string;
   matchingEligibilityReason?: string | null;
   matchingExplanation?: string | null;
   matchingFailureReason?: string | null;
   matchingEvaluatedAtUtc?: string | null;
   isApplied?: boolean;
   isSelected?: boolean;
   isReject?: boolean | null;
   displayName?: string;
   displayEmail?: string;
   phone?: string;
   dob?: string;
   genderDisplay?: string;
   avatarURL?: string;
   skill?: unknown[] | string | null;
   education?: unknown[] | string | null;
   jobExperience?: unknown[] | string | null;
   project?: unknown[] | string | null;
   certificate?: unknown[] | string | null;
   award?: unknown[] | string | null;
   jobDescription?: JobDetail;
   curriculumVitae?: CurriculumVitae;
}

export type ApplicationRecord = MatchingRecord;

export interface RecruiterCandidateDialogData {
   content: MatchingRecord[] | null;
   listType: number;
   recruiterId: number;
   jdId: number;
}

export interface FaqEntry {
   id: number;
   question: string;
   answer: string;
   keywords?: string | null;
   category: string;
   isPublished?: boolean;
   sortOrder?: number;
   updatedAt?: string;
}

export interface FaqEntryRequest {
   question: string;
   answer: string;
   keywords: string;
   category: string;
   isPublished: boolean;
   sortOrder: number;
}

export interface FaqChatResponse {
   answer: string;
   source: string;
   aiAvailable: boolean;
   matchedFaqId?: number | null;
}

export interface CatalogAdminEntry {
   id: number;
   name: string;
   description?: string | null;
   isActive: boolean;
}

export interface CatalogAdminSnapshot {
   categories: CatalogAdminEntry[];
   levels: CatalogAdminEntry[];
   employmentTypes: CatalogAdminEntry[];
}

export interface CatalogAdminRequest {
   name: string;
   description?: string | null;
}
