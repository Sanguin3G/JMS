import { inject, Component, ElementRef, ViewChild, HostListener, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { validateImageFile } from 'src/app/core/files/image-file';
import { NotificationService } from 'src/app/core/notifications/notification.service';
import { environment } from 'src/environments/environment';
import { ApiService, ApiResponse } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate, apiRecruiter } from 'src/app/service/constant';
import { AuthService } from 'src/app/core/auth/auth.service';

import { themeList } from './constant';
import { CatalogItem, CurriculumVitaePayload, CvAward, CvCertificate, CvEducation, CvExperience, CvProject, CvSkill, UserProfile } from 'src/app/core/models/api.models';

@Component({
  standalone: false,
   selector: 'app-create-cv',
   templateUrl: './create-cv.component.html',
   styleUrls: ['../../../../shared/cv-theme-picker.css', './create-cv.component.css'],
})
export class CandidateCreateCvComponent {
   private readonly auth = inject(AuthService);
   private readonly api = inject(ApiService);
   private readonly router = inject(Router);
   private readonly destroyRef = inject(DestroyRef);
   readonly themes = [0,1,2,3,4,5,6,7,8];
   validationMessages: string[] = [];
   catalogError = '';
   private initialSnapshot = '';
   private createdCvId: number | null = null;
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
   isSaving = false;

   form = {
      displayEmail: '', phone: '', dob: '', gender: '1', address: '', displayName: '', careerGoal: '', cvTitle: '',
      categoryId: '0', levelId: '0', employmentTypeId: '0',
   };
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
      this.form.displayEmail = this.profile?.email ?? '';
      this.form.displayName = this.profile?.fullName ?? '';
      this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => this.selectTheme(Number(params['id'])));
      this.getAllCategory();
      this.getAllTitle();
      this.getAllEmploymentType();
      this.initialSnapshot = this.snapshot();
   }

   getAllCategory() {
      this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.categories = res.data ?? [])
         .catch(() => this.catalogError = 'Không thể tải danh mục. Vui lòng tải lại trước khi lưu CV.');
   }

   getAllTitle() {
      this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_LEVEL_TITLE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.levels = res.data ?? [])
         .catch(() => this.catalogError = 'Không thể tải danh mục. Vui lòng tải lại trước khi lưu CV.');
   }

   getAllEmploymentType() {
      this.api.getRequest<ApiResponse<CatalogItem[]>>(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.employmentTypes = res.data ?? [])
         .catch(() => this.catalogError = 'Không thể tải danh mục. Vui lòng tải lại trước khi lưu CV.');
   }

   async submitCV() {
      if (this.createdCvId) { await this.router.navigate(['/candidate/update-cv', this.createdCvId]); return; }
      if (this.isSaving || this.catalogError || !this.validateForm()) return;
      this.isSaving = true;
      const data: CurriculumVitaePayload = {
         id: 0, candidateId: this.profile?.id ?? 0, careerGoal: this.form.careerGoal, employmentTypeName: this.form.employmentTypeId.toString(),
         phone: this.form.phone, displayName: this.form.displayName, genderDisplay: this.form.gender,
         displayEmail: this.form.displayEmail, address: this.form.address, dob: this.form.dob, jobExperiences: this.experiences, skills: this.skills, educations: this.educations,
         projects: this.projects, certificates: this.certificates, awards: this.awards, avatarURL: null, categoryName: '',
         categoryId: this.form.categoryId, genderId: this.form.gender, isFindingJob: true, levelTitle: this.form.levelId.toString(),
         cvTitle: this.form.cvTitle, theme: this.themeId, font: this.fontCV,
      };

      try {
         if (!this.profile?.id) throw new Error('Candidate profile is unavailable.');
         const response = await this.api.postRequest<ApiResponse<number>>(`${apiCandidate.CREATE_CV_BY_CANDIDATE_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, data);
         if (response?.statusCode !== 201) throw new Error('The CV could not be created.');
         if (!response.data) throw new Error('The CV id was not returned.');
         this.createdCvId = response.data;
         this.initialSnapshot = this.snapshot();
         if (this.avatarFile) {
            const formData = new FormData();
            formData.append('file', this.avatarFile, this.avatarFile.name);
            try {
               const imageResponse = await this.api.postFileRequest<ApiResponse<unknown>>(`${apiCandidate.UPDATE_IMAGES_CV}/${this.profile.id}/${response.data}`, AuthorizationMode.BEARER_TOKEN, formData);
               if (imageResponse.statusCode !== 200) throw new Error('Image upload failed');
            } catch { this.toastr.warning('CV đã được tạo, nhưng ảnh chưa lưu. Bạn có thể tải lại ảnh trong trang chỉnh sửa.'); }
         }
         this.toastr.success('Tạo hồ sơ thành công');
         await this.router.navigate(['/candidate/update-cv', response.data]);
      } catch (error) {
         this.toastr.error('Không thể tạo CV. Kiểm tra thông tin hoặc thử lại.');
      } finally {
         this.isSaving = false;
      }
   }

   async getFile(event: Event) {
      const input = event.target as HTMLInputElement;
      const [file] = Array.from(input.files ?? []);
      if (!file) return;
      const error = await validateImageFile(file);
      if (error) { this.toastr.error(error); input.value = ''; return; }
      this.avatarFile = file;
      this.hideImage = 'none';
      this.displayImage = 'block';
      this.displayChange = 'block';
      const reader = new FileReader();
      reader.onload = () => this.fileSrc = reader.result;
      reader.readAsDataURL(file);
   }

   chooseAvatar() { this.avatarInput?.nativeElement.click(); }
   reloadCatalogs(): void { this.catalogError = ''; this.getAllCategory(); this.getAllTitle(); this.getAllEmploymentType(); }

   selectTheme(value: number) {
      const theme = themeList[value] ?? themeList[6] ?? themeList[0];
      this.themeId = theme === themeList[value] ? value : 6;
      this.colorLeftHeader = theme.colorLeftHeader;
      this.colorRightHeader = theme.colorRightHeader;
      this.colorLeftInput = theme.colorLeftInput;
      this.ThemStyle = theme.ThemStyle;
      this.backgroundSelectedLink = theme.backgroundSelectedLink;
   }

   addSkill() { this.skills.push(this.createSkill()); }
   removeSkill(index: number) { this.remove(this.skills, index); }
   addCertificate() { this.certificates.push(this.createCertificate()); }
   removeCertificate(index: number) { this.remove(this.certificates, index); }
   addAward() { this.awards.push(this.createAward()); }
   removeAward(index: number) { this.remove(this.awards, index); }
   addExperience() { this.experiences.push(this.createExperience()); }
   removeExperience(index: number) { this.remove(this.experiences, index); }
   addProject() { this.projects.push(this.createProject()); }
   removeProject(index: number) { this.remove(this.projects, index); }
   addEducation() { this.educations.push(this.createEducation()); }
   removeEducation(index: number) { this.remove(this.educations, index); }
   trackByIndex(index: number) { return index; }

   private validateForm() {
      const messages: string[] = [];
      if (this.form.categoryId === '0') messages.push('Lĩnh vực không được để trống');
      if (this.form.levelId === '0') messages.push('Cấp bậc không được để trống');
      if (this.form.employmentTypeId === '0') messages.push('Loại việc làm không được để trống');
      if (!/^\d{9,10}$/.test(this.form.phone)) messages.push('Số điện thoại phải có 9 hoặc 10 chữ số');
      if (!this.hasValidAge(this.form.dob)) messages.push('Ngày sinh không hợp lệ');
      if (!this.form.cvTitle.trim()) messages.push('Tên hồ sơ không được để trống');
      if (!this.form.displayName.trim()) messages.push('Họ tên không được để trống');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.displayEmail)) messages.push('Email chưa hợp lệ');
      if (this.skills.some(skill => !skill.skillDescription.trim())) messages.push('Kỹ năng không thể để trống');
      if (this.experiences.some(experience => Object.values(experience).some(value => typeof value === 'string' && value.trim() && value !== '1') && (!experience.ComapanyName.trim() || !experience.position.trim() || !this.isValidMonthYear(experience.fromDate) || !this.isValidMonthYear(experience.toDate)))) {
         messages.push('Mỗi kinh nghiệm cần đủ công ty, vị trí, mô tả và thời gian mm/yyyy');
      }
      if (this.educations.some(education => (education.schoolName.trim() || education.majorName.trim() || education.description.trim()) && (!education.schoolName.trim() || !education.majorName.trim()))) messages.push('Mỗi mục học vấn cần có tên trường và ngành học');
      this.validationMessages = messages;
      if (messages.length) {
         this.toastr.error('Vui lòng kiểm tra các trường được liệt kê phía trên CV.');
         document.getElementById('cv-validation')?.focus();
         return false;
      }
      return true;
   }

   private hasValidAge(value: string) {
      const birthDate = new Date(value);
      if (Number.isNaN(birthDate.getTime())) return false;
      const now = new Date();
      let age = now.getFullYear() - birthDate.getFullYear();
      if (new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()) > now) age--;
      return age >= 16 && age <= 100;
   }

   private isValidMonthYear(value: string) { return /^(0?[1-9]|1[0-2])\/\d{4}$/.test(value); }
   hasUnsavedChanges(): boolean { return !this.createdCvId && this.initialSnapshot !== '' && this.snapshot() !== this.initialSnapshot; }
   @HostListener('window:beforeunload', ['$event']) onBeforeUnload(event: BeforeUnloadEvent): void { if (this.hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ''; } }
   private snapshot(): string { return JSON.stringify({ form: this.form, skills: this.skills, certificates: this.certificates, awards: this.awards, experiences: this.experiences, projects: this.projects, educations: this.educations, font: this.fontCV, theme: this.themeId, avatar: this.avatarFile?.name }); }
   private remove<T>(items: T[], index: number) { if (items.length > 1) items.splice(index, 1); }
   private createSkill(): CvSkill { return { title: '', skillDescription: '' }; }
   private createCertificate(): CvCertificate { return { certificateName: '', certificateProvider: '', issuedDate: '', expiredDate: '', credentialURL: '' }; }
   private createAward(): CvAward { return { fromYear: '', awardName: '', description: '' }; }
   private createExperience(): CvExperience { return { ComapanyName: '', position: '', fromDate: '', toDate: '', description: '', employmentTypeName: '1' }; }
   private createProject(): CvProject { return { projectName: '', fromDate: '', toDate: '', description: '', isStillWorking: false }; }
   private createEducation(): CvEducation { return { schoolName: '', majorName: '', description: '', fromYear: '', toYear: '', stillLearning: false }; }
}
