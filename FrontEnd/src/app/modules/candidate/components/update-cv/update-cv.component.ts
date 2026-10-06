import { inject, Component, ElementRef, ViewChild, HostListener, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { validateImageFile } from 'src/app/core/files/image-file';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { environment } from 'src/environments/environment';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate, apiRecruiter } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';

import { themeList } from './constant';
import { CatalogItem, CurriculumVitae, CurriculumVitaePayload, CvAward, CvCertificate, CvEducation, CvExperience, CvProject, CvSkill, UserProfile } from 'src/app/core/models/api.models';

@Component({
  standalone: false,
   selector: 'app-update-cv',
   templateUrl: './update-cv.component.html',
   styleUrls: ['../../../../shared/cv-theme-picker.css', './update-cv.component.css']
})
export class UpdateCvComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);
   private readonly destroyRef = inject(DestroyRef);
   readonly themes = [0,1,2,3,4,5,6,7,8];
   validationMessages: string[] = [];
   loading = true;
   loadError = '';
   savedMessage = '';
   private initialSnapshot = '';
   categories: CatalogItem[] = [];
   levels: CatalogItem[] = [];
   employmentTypes: CatalogItem[] = [];
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
   profile: UserProfile | null;
   cvId = 0;
   isSaving = false;

   form = { displayEmail: '', phone: '', dob: '', gender: '1', address: '', displayName: '', careerGoal: '', cvTitle: '', categoryId: '0', levelId: '0', employmentTypeId: '0' };
   skills: CvSkill[] = [this.createSkill()];
   certificates: CvCertificate[] = [this.createCertificate()];
   awards: CvAward[] = [this.createAward()];
   experiences: CvExperience[] = [this.createExperience()];
   projects: CvProject[] = [this.createProject()];
   educations: CvEducation[] = [this.createEducation()];
   private avatarFile?: File;

   @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;

   constructor(private readonly route: ActivatedRoute, private readonly toastr: NotificationService) {
      this.profile = this.auth.getProfile();
      this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
         this.cvId = Number(params['id']) || 0;
         void this.loadCv();
      });
   }

   async loadCv() {
      this.loading = true;
      this.loadError = '';
      try {
         const [categories, levels, employmentTypes] = await Promise.all([
            this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 }),
            this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_LEVEL_TITLE, AuthorizationMode.PUBLIC, { page: 10 }),
            this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC, { page: 10 }),
         ]);
         this.categories = categories?.data ?? [];
         this.levels = levels?.data ?? [];
         this.employmentTypes = employmentTypes?.data ?? [];

         if (!this.profile?.id || !this.cvId) throw new Error('Candidate profile or CV is unavailable.');
         const response = await this.api.getRequest<ApiResponse<CurriculumVitae>>(`${apiCandidate.GET_CV_CANDIDATE_BY_ID}/${this.profile.id}/${this.cvId}`, AuthorizationMode.BEARER_TOKEN);
         if (response.statusCode !== 200 || !response.data) throw new Error('CV not found');
         this.applyCv(response.data);
         this.initialSnapshot = this.snapshot();
      } catch (error) {
         this.loadError = 'Không thể tải CV hoặc danh mục. Vui lòng thử lại.';
      } finally { this.loading = false; }
   }

   async submitCV() {
      if (this.isSaving || this.loading || this.loadError || !this.validateForm()) return;
      this.isSaving = true;
      const data: CurriculumVitaePayload = {
         id: this.cvId, candidateId: this.profile?.id ?? 0, careerGoal: this.form.careerGoal, employmentTypeName: this.form.employmentTypeId.toString(), phone: this.form.phone,
         displayName: this.form.displayName, genderDisplay: this.form.gender, displayEmail: this.form.displayEmail,
         address: this.form.address, dob: this.form.dob, jobExperiences: this.experiences,
         skills: this.skills, educations: this.educations, projects: this.projects, certificates: this.certificates, awards: this.awards,
         avatarURL: '', categoryName: '', categoryId: this.form.categoryId, genderId: this.form.gender, isFindingJob: true,
         levelTitle: this.form.levelId.toString(), cvTitle: this.form.cvTitle, theme: this.themeId, font: this.fontCV,
      };
      try {
         if (!this.profile?.id || !this.cvId) throw new Error('Candidate profile or CV is unavailable.');
         const response = await this.api.postRequest<ApiResponse<number>>(`${apiCandidate.UPDATE_CV_BY_CANDIDATE_ID}?candidateId=${this.profile.id}&cvId=${this.cvId}`, AuthorizationMode.BEARER_TOKEN, data);
         if (response.statusCode !== 200) throw new Error('CV update failed');
         if (this.avatarFile) {
            const formData = new FormData();
            formData.append('file', this.avatarFile, this.avatarFile.name);
            const imageResponse = await this.api.postFileRequest<ApiResponse<unknown>>(`${apiCandidate.UPDATE_IMAGES_CV}/${this.profile.id}/${this.cvId}`, AuthorizationMode.BEARER_TOKEN, formData);
            if (imageResponse.statusCode !== 200) { this.toastr.warning('Nội dung CV đã lưu, nhưng ảnh chưa được cập nhật. Thử lưu lại để tải ảnh.'); return; }
         }
         this.avatarFile = undefined;
         this.initialSnapshot = this.snapshot();
         this.savedMessage = 'Đã lưu thay đổi.';
         this.toastr.success('Chỉnh sửa hồ sơ thành công');
      } catch (error) {
         this.toastr.error('Cập nhật hồ sơ thất bại');
      } finally { this.isSaving = false; }
   }

   async getFile(event: Event) {
      const input = event.target as HTMLInputElement;
      const [file] = Array.from(input.files ?? []);
      if (!file) return;
      const error = await validateImageFile(file);
      if (error) { this.toastr.error(error); input.value = ''; return; }
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

   private applyCv(cv: CurriculumVitae) {
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
      if (!/^\d{9,10}$/.test(this.form.phone)) messages.push('Số điện thoại phải có 9 hoặc 10 chữ số');
      if (!this.form.dob) messages.push('Ngày sinh không được để trống');
      if (!this.form.cvTitle.trim()) messages.push('Tên hồ sơ không được để trống');
      if (!this.form.displayName.trim()) messages.push('Họ tên không được để trống');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.displayEmail)) messages.push('Email chưa hợp lệ');
      this.validationMessages = messages;
      if (messages.length) { this.toastr.info('Vui lòng kiểm tra các trường được liệt kê phía trên CV.'); document.getElementById('cv-validation')?.focus(); return false; }
      return true;
   }
   private resolveId(items: CatalogItem[], property: keyof CatalogItem, title: unknown, fallback: unknown) { return String(fallback ?? items.find(item => item[property] === title)?.id ?? '0'); }
   hasUnsavedChanges(): boolean { return this.initialSnapshot !== '' && this.snapshot() !== this.initialSnapshot; }
   @HostListener('window:beforeunload', ['$event']) onBeforeUnload(event: BeforeUnloadEvent): void { if (this.hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ''; } }
   private snapshot(): string { return JSON.stringify({ form: this.form, skills: this.skills, certificates: this.certificates, awards: this.awards, experiences: this.experiences, projects: this.projects, educations: this.educations, font: this.fontCV, theme: this.themeId, avatar: this.avatarFile?.name }); }
   private toInputDate(value?: string) { if (!value) return ''; if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10); const parts = value.split('/'); return parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}` : ''; }
   private withFallback<T>(items: T[] | undefined, fallback: T) { return items?.length ? items : [fallback]; }
   private remove<T>(items: T[], index: number) { if (items.length > 1) items.splice(index, 1); }
   private createSkill(): CvSkill { return { title: '', skillDescription: '' }; }
   private createCertificate(): CvCertificate { return { certificateName: '', certificateProvider: '', issuedDate: '', expiredDate: '', credentialURL: '' }; }
   private createAward(): CvAward { return { fromYear: '', awardName: '', description: '' }; }
   private createExperience(): CvExperience { return { ComapanyName: '', position: '', fromDate: '', toDate: '', description: '', employmentTypeName: '1' }; }
   private createProject(): CvProject { return { projectName: '', fromDate: '', toDate: '', description: '', isStillWorking: false }; }
   private createEducation(): CvEducation { return { schoolName: '', majorName: '', description: '', fromYear: '', toYear: '', stillLearning: false }; }
}
