import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { getRequest, postFileRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate, apiRecruiter } from 'src/app/service/constant';
import { getProfile } from 'src/app/service/localstorage';
import { showError, showInfo, showSuccess } from 'src/app/service/common';
import { themeList } from './constant';

interface SkillDraft { title: string; skillDescription: string; }
interface CertificateDraft { certificateName: string; certificateProvider: string; issuedDate: string; expiredDate: string; credentialURL: string; }
interface AwardDraft { fromYear: string; awardName: string; description: string; }
interface ExperienceDraft { ComapanyName: string; position: string; fromDate: string; toDate: string; description: string; employmentTypeName: string; }
interface ProjectDraft { projectName: string; fromDate: string; toDate: string; description: string; isStillWorking: boolean; }
interface EducationDraft { schoolName: string; majorName: string; description: string; fromYear: string; toYear: string; stillLearning: boolean; }

@Component({
   selector: 'app-update-cv',
   templateUrl: './update-cv.component.html',
   styleUrls: ['./update-cv.component.css']
})
export class UpdateCvComponent {
   categories: any[] = [];
   levels: any[] = [];
   employmentTypes: any[] = [];
   readonly apiURL = environment.Url;
   hideImage = 'block';
   displayImage = 'none';
   displayChange = 'none';
   fileSrc?: string | ArrayBuffer | null;
   fontCV = 'Sans-serif';
   colorLeftHeader = '#444444';
   colorRightHeader = '#111111';
   colorLeftInput = '#111111';
   ThemStyle = 'Theme6';
   backgroundSelectedLink = `${environment.Url}/assets/images/theme6.jpg`;
   themeId = 6;
   profile: any;
   cvId = 0;
   isSaving = false;

   form = { displayEmail: '', phone: '', dob: '', gender: '1', address: '', displayName: '', careerGoal: '', cvTitle: '', categoryId: '0', levelId: '0', employmentTypeId: '0' };
   skills: SkillDraft[] = [this.createSkill()];
   certificates: CertificateDraft[] = [this.createCertificate()];
   awards: AwardDraft[] = [this.createAward()];
   experiences: ExperienceDraft[] = [this.createExperience()];
   projects: ProjectDraft[] = [this.createProject()];
   educations: EducationDraft[] = [this.createEducation()];
   private avatarFile?: File;

   @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;

   constructor(private readonly route: ActivatedRoute, private readonly toastr: ToastrService) {
      this.profile = getProfile();
      this.route.params.subscribe(params => {
         this.cvId = Number(params['id']) || 0;
         void this.loadCv();
      });
   }

   async loadCv() {
      try {
         const [categories, levels, employmentTypes] = await Promise.all([
            getRequest(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 }),
            getRequest(apiRecruiter.GET_ALL_LEVEL_TITLE, AuthorizationMode.PUBLIC, { page: 10 }),
            getRequest(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC, { page: 10 }),
         ]);
         this.categories = categories?.data ?? [];
         this.levels = levels?.data ?? [];
         this.employmentTypes = employmentTypes?.data ?? [];

         const response = await getRequest(`${apiCandidate.GET_CV_CANDIDATE_BY_ID}/${this.profile.id}/${this.cvId}`, AuthorizationMode.BEARER_TOKEN);
         if (!response?.data) throw new Error('CV not found');
         this.applyCv(response.data);
      } catch (error) {
         console.error(error);
         showError(this.toastr, 'Không thể tải hồ sơ');
      }
   }

   async submitCV() {
      if (this.isSaving || !this.validateForm()) return;
      this.isSaving = true;
      const data = {
         id: 0, candidateId: 1, careerGoal: this.form.careerGoal, employmentTypeName: this.form.employmentTypeId.toString(), phone: this.form.phone,
         displayName: this.form.displayName, genderDisplay: this.form.gender, gender: this.form.gender, displayEmail: this.form.displayEmail,
         address: this.form.address, dob: this.form.dob, createdDateDisplay: null, lastUpdateDateDisplay: null, jobExperiences: this.experiences,
         skills: this.skills, educations: this.educations, projects: this.projects, certificates: this.certificates, awards: this.awards,
         avatarURL: '', categoryName: '', categoryId: this.form.categoryId, genderId: this.form.gender, isFindingJob: true,
         levelTitle: this.form.levelId.toString(), cvTitle: this.form.cvTitle, theme: this.themeId, font: this.fontCV,
      };
      try {
         await postRequest(`${apiCandidate.UPDATE_CV_BY_CANDIDATE_ID}?candidateId=${this.profile.id}&cvId=${this.cvId}`, AuthorizationMode.BEARER_TOKEN, data);
         if (this.avatarFile) {
            const formData = new FormData();
            formData.append('file', this.avatarFile, this.avatarFile.name);
            await postFileRequest(`${apiCandidate.UPDATE_IMAGES_CV}/${this.profile.id}/${this.cvId}`, AuthorizationMode.BEARER_TOKEN, formData);
         }
         showSuccess(this.toastr, 'Chỉnh sửa hồ sơ thành công');
      } catch (error) {
         console.error(error);
         showError(this.toastr, 'Cập nhật hồ sơ thất bại');
      } finally { this.isSaving = false; }
   }

   getFile(event: Event) {
      const [file] = Array.from((event.target as HTMLInputElement).files ?? []);
      if (!file) return;
      this.avatarFile = file;
      this.hideImage = 'none'; this.displayImage = 'block'; this.displayChange = 'block';
      const reader = new FileReader();
      reader.onload = () => this.fileSrc = reader.result;
      reader.readAsDataURL(file);
   }

   chooseAvatar() { this.avatarInput?.nativeElement.click(); }
   selectTheme(value: number) {
      const theme = themeList[value] ?? themeList[6] ?? themeList[0];
      this.themeId = theme === themeList[value] ? value : 6;
      this.colorLeftHeader = theme.colorLeftHeader; this.colorRightHeader = theme.colorRightHeader; this.colorLeftInput = theme.colorLeftInput;
      this.ThemStyle = theme.ThemStyle; this.backgroundSelectedLink = theme.backgroundSelectedLink;
   }
   addSkill() { this.skills.push(this.createSkill()); } removeSkill(index: number) { this.remove(this.skills, index); }
   addCertificate() { this.certificates.push(this.createCertificate()); } removeCertificate(index: number) { this.remove(this.certificates, index); }
   addAward() { this.awards.push(this.createAward()); } removeAward(index: number) { this.remove(this.awards, index); }
   addExperience() { this.experiences.push(this.createExperience()); } removeExperience(index: number) { this.remove(this.experiences, index); }
   addProject() { this.projects.push(this.createProject()); } removeProject(index: number) { this.remove(this.projects, index); }
   addEducation() { this.educations.push(this.createEducation()); } removeEducation(index: number) { this.remove(this.educations, index); }
   trackByIndex(index: number) { return index; }

   private applyCv(cv: any) {
      this.form = {
         displayEmail: cv.displayEmail ?? '', phone: cv.phone ?? '', dob: this.toInputDate(cv.dob), gender: String(cv.genderId ?? 1), address: cv.address ?? '',
         displayName: cv.displayName ?? '', careerGoal: cv.careerGoal ?? '', cvTitle: cv.cvTitle ?? '',
         categoryId: this.resolveId(this.categories, 'categoryName', cv.categoryName, cv.categoryId),
         levelId: this.resolveId(this.levels, 'title', cv.levelTitle, cv.levelId),
         employmentTypeId: this.resolveId(this.employmentTypes, 'title', cv.employmentTypeName, cv.employmentTypeId),
      };
      this.skills = this.withFallback(cv.skills, this.createSkill());
      this.certificates = this.withFallback(cv.certificates, this.createCertificate());
      this.awards = this.withFallback(cv.awards, this.createAward());
      this.experiences = this.withFallback(cv.jobExperiences?.map((experience: any) => ({
         ...this.createExperience(),
         ...experience,
         ComapanyName: experience.ComapanyName ?? experience.comapanyName ?? '',
      })), this.createExperience());
      this.projects = this.withFallback(cv.projects, this.createProject());
      this.educations = this.withFallback(cv.educations, this.createEducation());
      this.fontCV = cv.font || 'Sans-serif';
      this.selectTheme(Number(cv.theme));
      this.fileSrc = cv.avatarURL;
      this.hideImage = 'none'; this.displayImage = 'block'; this.displayChange = 'block';
   }

   private validateForm() {
      const messages: string[] = [];
      if (this.form.categoryId === '0') messages.push('Lĩnh vực không được để trống');
      if (this.form.levelId === '0') messages.push('Cấp bậc không được để trống');
      if (this.form.employmentTypeId === '0') messages.push('Loại việc làm không được để trống');
      if (!this.form.phone.trim()) messages.push('Số điện thoại không được để trống');
      if (!this.form.dob) messages.push('Ngày sinh không được để trống');
      if (!this.form.cvTitle.trim()) messages.push('Tên hồ sơ không được để trống');
      if (messages.length) { showInfo(this.toastr, messages.map(message => `- ${message}`).join('<br/>')); return false; }
      return true;
   }
   private resolveId(items: any[], property: string, title: any, fallback: any) { return String(fallback ?? items.find(item => item[property] === title)?.id ?? '0'); }
   private toInputDate(value: string) { if (!value) return ''; if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10); const parts = value.split('/'); return parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}` : ''; }
   private withFallback<T>(items: T[] | undefined, fallback: T) { return items?.length ? items : [fallback]; }
   private remove<T>(items: T[], index: number) { if (items.length > 1) items.splice(index, 1); }
   private createSkill(): SkillDraft { return { title: '', skillDescription: '' }; }
   private createCertificate(): CertificateDraft { return { certificateName: '', certificateProvider: '', issuedDate: '', expiredDate: '', credentialURL: '' }; }
   private createAward(): AwardDraft { return { fromYear: '', awardName: '', description: '' }; }
   private createExperience(): ExperienceDraft { return { ComapanyName: '', position: '', fromDate: '', toDate: '', description: '', employmentTypeName: '1' }; }
   private createProject(): ProjectDraft { return { projectName: '', fromDate: '', toDate: '', description: '', isStillWorking: false }; }
   private createEducation(): EducationDraft { return { schoolName: '', majorName: '', description: '', fromYear: '', toYear: '', stillLearning: false }; }
}
