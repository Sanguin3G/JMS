export const ITEM_LOAD = 20;
export const AVATAR_DEFAULT_URL = 'https://gcavocats.ca/wp-content/uploads/2018/09/man-avatar-icon-flat-vector-19152370-1.jpg';
export const IMG_LOADING = 'https://truetech.com.vn/wp-content/uploads/2021/07/loading.gif';
export const RECRUITER_TOKEN = 'recruiter-token'
export const CANDIDATE_TOKEN = 'candidate-token'
export const ADMIN_TOKEN = 'admin-token';
export const ADMIN_PROFILE = 'admin-profile';

export enum AuthorizationMode {
   PUBLIC = 0,
   ACCESS_TOKEN = 1,
   BEARER_TOKEN = 2,
}

export enum apiRecruiter {
   //Job
   GET_ALL_CATEGORY = "/api/RecuirterCommon/all-category",
   GET_ALL_GENDER = "/api/RecuirterCommon/all-gender",
   GET_ALL_LEVEL_TITLE = "/api/RecuirterCommon/all-level-title",
   GET_ALL_EMPLOYMENT_TYPE = "/api/RecuirterCommon/all-employment-type",


   GET_CV_MATCHED = "/api/Recuirter/get-all-cv-matched-by-number-requirement",
   GET_CV_MATCHED_LEFT = "/api/Recuirter/get-all-cv-matched",
   GET_CV_SELECTED = "/api/Recuirter/get-all-cv-selected",
   MATCHING_JOB = "/api/Recuirter/matching-job",
   GET_ESTIMATE_TIME = "/api/Recuirter/get-estimate-date-to-matching/",

   POST_CREATE_JD = "/api/JobDesc/new-post",
   GET_JD_BY_ID = "/api/JobDesc/get-jd-by-id",
   GET_JD_BY_RECRUITER = "/api/JobDesc/get-jd-detail",
   UPDATE_JD_BY_RECRUITER = "/api/JobDesc/update-jd",
   GET_LIST_JD_EXPIRED = "/api/Recuirter/get-all-expired-jd",

   //CV
   UPDATE_CV_SELECTED_STATUS = "/api/Recuirter/update-cv-selected-status",
   REJECT_CV = "/api/Recuirter/reject-cv",

   //Image
   UPDATE_IMAGE_COMPANY_AVATAR = "/api/Images/update-img-avt-company",
   UPDATE_IMAGE_COMPANY_BACKGROUND = "/api/Images/update-img-bgr-company",
   UPDATE_IMAGE_RECRUITER = "/api/Images/update-img-recuirter",

   //Profile
   LOGIN_RECRUITER = "/api/Token/login-recuirter",
   GET_PROFILE_RECRUITER = "/api/Token/get-data-recruiter",
   REGISTER_ACCOUNT_RECRUITER = "/api/Registers/register-for-recuirter",
   UPDATE_PROFILE = "/api/Recuirter/update-profile",
   CHANGE_PASSWORD = "/api/Recuirter/change-password",
   FORGOT_PASSWORD_RECRUITER = "/api/Email/forgot-recruiter-password",


   //Company
   GET_COMPANY_JDS_PAGING = "/api/JobDesc/all-jd-by-company",
   DELETE_JD_BY_ID = "/api/JobDesc/delete-jd",
   CREATE_COMPANY_BY_ID = "/api/Companys/create-by-recuirter",
   UPDATE_COMPANY = "/api/Companys/update-by-recuirter",
   GET_COMPANY_PAGING = "/api/Companys/get-all",
   GET_COMPANY_BY_ID = "/api/Companys/get-by-id",
   SEARCH_COMPANY = "/api/Companys/search",

}

export enum apiCandidate {
   //Job
   GET_ALL_JDS_PAGING = "/api/JobDesc/get-all-jd",
   GET_JD_BY_ID = "/api/JobDesc/get-jd-by-id",
   CANDIDATE_APPLYJOB = "/api/Candidate/apply-cv",

   //CV
   GET_ALL_CV_BY_RECRUITER_ID = "/api/CVs/all-cv",
   CREATE_CV_BY_CANDIDATE_ID = "/api/CVs/new-cv",
   UPDATE_CV_BY_CANDIDATE_ID = "/api/CVs/update-cv",
   GET_ALL_CV_BY_ID = "/api/CVs/all-cv",
   GET_ALL_CV_APPLIED = "/api/Candidate/get-all-cv-applied",
   GET_CV_CANDIDATE_BY_ID = "/api/CVs/getCV",
   DELETE_CV_BY_ID = "/api/CVs/delete-cv",
   CHANGE_FINDING_JOB_STATUS = "/api/CVs/change-is-finding-job-status",

   //Image
   UPLOAD_AVATAR_CV_ID = "/api/Images/upload-img-cv",
   UPDATE_IMAGES_CV = "/api/Images/update-img-cv",
   UPDATE_AVATAR_CANDIDATE = "/api/Images/update-img-candidate",

   //Profile
   LOGIN_CANDIDATE = "/api/Token/login-candidate",
   GET_PROFILE_USER = "/api/Token/get-data-candidate",
   FORGOT_PASSWORD_CANDIDATE = "/api/Email/forgot-candidate-password",
   REGISTER_ACCOUNT_CANDIDATE = "/api/Registers/register-for-candidate",
   UPDATE_PROFILE_CANDIDATE = "/api/Candidate/update-profile",
   CHANGE_PASSWORD_CANDIDATE = "/api/Candidate/change-password",

}

export enum apiAdmin{
    GET_ALL_COMPANY = '/api/Admin/get-all-companies',
    GET_ALL_RECRUITER = '/api/Admin/get-all-recruiters',
    GET_ALL_CANDIDATE = '/api/Admin/get-all-candidates',
    GET_COMPANY_BY_ID = '/api/Admin/get-company-by-id',
    GET_RECRUITER_BY_ID = '/api/Admin/get-recruiter-by-id',
    GET_CANDIDATE_BY_ID = '/api/Admin/get-candidate-by-id',
    GET_JD_BY_ID = '/api/Admin/get-jd-by-id',
    GET_ALL_CV_BY_ID = '/api/Admin/get-all-cv-by-candidateid?candidateId=',
    LOGIN_ADMIN = '/api/Token/login-admin',
    GET_ADMIN_PROFILE = '/api/Token/get-data-admin',
    CHANGE_ACTIVE_CANDIDATE = '/api/Admin/update-active-status?candidateId=',
    CHANGE_ACTIVE_RECRUITER = '/api/Admin/update-active-status?recruiterId=',
    GET_STATISTIC = '/api/Admin/get-statistic',
    CHANGE_PASSWORD = '/api/Admin/change-password',
    GET_GEMINI_OPTIONS = '/api/admin/ai-profiles/gemini-options',
    AI_PROFILES = '/api/admin/ai-profiles',
}
