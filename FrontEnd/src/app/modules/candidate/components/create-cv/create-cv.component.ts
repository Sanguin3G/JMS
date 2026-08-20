import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { getRequest, postFileRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiCandidate, apiRecruiter } from 'src/app/service/constant';
import { getProfile } from 'src/app/service/localstorage';
import { showError, showSuccess } from 'src/app/service/common';
import { themeList } from './constant';

interface SkillDraft { title: string; skillDescription: string; }
interface CertificateDraft { certificateName: string; certificateProvider: string; issuedDate: string; expiredDate: string; credentialURL: string; }
interface AwardDraft { fromYear: string; awardName: string; description: string; }
interface ExperienceDraft { ComapanyName: string; position: string; fromDate: string; toDate: string; description: string; employmentTypeName: string; }
interface ProjectDraft { projectName: string; fromDate: string; toDate: string; description: string; isStillWorking: boolean; }
interface EducationDraft { schoolName: string; majorName: string; description: string; fromYear: string; toYear: string; stillLearning: boolean; }

@Component({
  standalone: false,
   selector: 'app-create-cv',
   templateUrl: './create-cv.component.html',
   styleUrls: ['./create-cv.component.css'],
})
export class CandidateCreateCvComponent {
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
   isSaving = false;

   form = {
      displayEmail: '', phone: '', dob: '', gender: '1', address: '', displayName: '', careerGoal: '', cvTitle: '',
      categoryId: '0', levelId: '0', employmentTypeId: '0',
   };
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
      this.form.displayEmail = this.profile?.email ?? '';
      this.form.displayName = this.profile?.fullName ?? '';
      this.route.params.subscribe(params => this.selectTheme(Number(params['id'])));
      this.getAllCategory();
      this.getAllTitle();
      this.getAllEmploymentType();
   }

   getAllCategory() {
      getRequest(apiRecruiter.GET_ALL_CATEGORY, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.categories = res.data ?? [])
         .catch(error => console.warn(apiRecruiter.GET_ALL_CATEGORY, error));
   }

   getAllTitle() {
      getRequest(apiRecruiter.GET_ALL_LEVEL_TITLE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.levels = res.data ?? [])
         .catch(error => console.warn(apiRecruiter.GET_ALL_LEVEL_TITLE, error));
   }

   getAllEmploymentType() {
      getRequest(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, AuthorizationMode.PUBLIC, { page: 10 })
         .then(res => this.employmentTypes = res.data ?? [])
         .catch(error => console.warn(apiRecruiter.GET_ALL_EMPLOYMENT_TYPE, error));
   }

   async submitCV() {
      if (this.isSaving || !this.validateForm()) return;
      this.isSaving = true;
      const data = {
         id: 0, candidateId: 1, careerGoal: this.form.careerGoal, employmentTypeName: this.form.employmentTypeId.toString(),
         phone: this.form.phone, displayName: this.form.displayName, genderDisplay: this.form.gender, gender: this.form.gender,
         displayEmail: this.form.displayEmail, address: this.form.address, dob: this.form.dob, createdDateDisplay: null,
         lastUpdateDateDisplay: null, jobExperiences: this.experiences, skills: this.skills, educations: this.educations,
         projects: this.projects, certificates: this.certificates, awards: this.awards, avatarURL: null, categoryName: '',
         categoryId: this.form.categoryId, genderId: this.form.gender, isFindingJob: true, levelTitle: this.form.levelId.toString(),
         cvTitle: this.form.cvTitle, theme: this.themeId, font: this.fontCV,
      };

      try {
         const response = await postRequest(`${apiCandidate.CREATE_CV_BY_CANDIDATE_ID}/${this.profile.id}`, AuthorizationMode.BEARER_TOKEN, data);
         if (response?.statusCode !== 201) throw new Error('The CV could not be created.');
         if (this.avatarFile) {
            const formData = new FormData();
            formData.append('file', this.avatarFile, this.avatarFile.name);
            await postFileRequest(`${apiCandidate.UPDATE_IMAGES_CV}/${this.profile.id}/${response.data}`, AuthorizationMode.BEARER_TOKEN, formData);
         }
         showSuccess(this.toastr, 'Tạo hồ sơ thành công');
      } catch (error) {
         console.error(error);
         showError(this.toastr, 'Đã có lỗi xảy ra, xem lại trường dữ liệu');
      } finally {
         this.isSaving = false;
      }
   }

   getFile(event: Event) {
      const input = event.target as HTMLInputElement;
      const [file] = Array.from(input.files ?? []);
      if (!file) return;
      this.avatarFile = file;
      this.hideImage = 'none';
      this.displayImage = 'block';
      this.displayChange = 'block';
      const reader = new FileReader();
      reader.onload = () => this.fileSrc = reader.result;
      reader.readAsDataURL(file);
   }

   chooseAvatar() { this.avatarInput?.nativeElement.click(); }

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
      if (this.skills.some(skill => !skill.skillDescription.trim())) messages.push('Kỹ năng không thể để trống');
      if (this.experiences.some(experience => !experience.ComapanyName.trim() || !experience.position.trim() || !experience.description.trim() || !this.isValidMonthYear(experience.fromDate) || !this.isValidMonthYear(experience.toDate))) {
         messages.push('Mỗi kinh nghiệm cần đủ công ty, vị trí, mô tả và thời gian mm/yyyy');
      }
      if (this.educations.some(education => !education.schoolName.trim() || !education.majorName.trim())) messages.push('Mỗi mục học vấn cần có tên trường và ngành học');
      if (messages.length) {
         showError(this.toastr, messages.map(message => `- ${message}`).join('<br/>'));
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
   private remove<T>(items: T[], index: number) { if (items.length > 1) items.splice(index, 1); }
   private createSkill(): SkillDraft { return { title: '', skillDescription: '' }; }
   private createCertificate(): CertificateDraft { return { certificateName: '', certificateProvider: '', issuedDate: '', expiredDate: '', credentialURL: '' }; }
   private createAward(): AwardDraft { return { fromYear: '', awardName: '', description: '' }; }
   private createExperience(): ExperienceDraft { return { ComapanyName: '', position: '', fromDate: '', toDate: '', description: '', employmentTypeName: '1' }; }
   private createProject(): ProjectDraft { return { projectName: '', fromDate: '', toDate: '', description: '', isStillWorking: false }; }
   private createEducation(): EducationDraft { return { schoolName: '', majorName: '', description: '', fromYear: '', toYear: '', stillLearning: false }; }
}
