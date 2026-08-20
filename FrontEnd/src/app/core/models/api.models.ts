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
}

export interface MatchingRecord {
   id: number;
   candidateId?: number;
   jobDescriptionId?: number;
   percentMatching?: number;
   jsonMatching?: string;
   isApplied?: boolean;
   isSelected?: boolean;
   isReject?: boolean;
}
