import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from 'src/app/core/http/api.service';
import { AuthorizationMode, apiCandidate, apiRecruiter } from 'src/app/service/constant';
import { SharedModule } from '../shared.module';
@Component({
  selector: 'jms-auth-register', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedModule],
  templateUrl: './auth-register.component.html',
  styleUrls: ['../auth-sign-in/auth-sign-in.component.css'],
})
export class AuthRegisterComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly role = this.router.url.split('/')[1] === 'recruiter' ? 'recruiter' : 'candidate';
  readonly roleLabel = this.role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng';
  readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(35), Validators.pattern(/^[\p{L} ]+$/u)] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{6,35}$/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?=.*[!@#$%^&*()\-+])(?=.*[0-9])(?=.*[A-Z]).{8,35}$/)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: group => group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true } });
  showPassword = false;
  submitting = false;
  error = '';
  success = false;
  async submit(): Promise<void> {
    if (this.submitting) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = '';
    try {
      const response = await this.api.postRequest(this.role === 'candidate' ? apiCandidate.REGISTER_ACCOUNT_CANDIDATE : apiRecruiter.REGISTER_ACCOUNT_RECRUITER, AuthorizationMode.PUBLIC, this.form.getRawValue());
      if (response.statusCode === 200 && response.message === 'Register successful') {
        this.success = true;
        this.form.reset();
      } else {
        this.error = response.message === 'Email exist in system' ? 'Email đã được sử dụng.' : response.message === 'Username exist in system' ? 'Tên đăng nhập đã được sử dụng.' : 'Không thể tạo tài khoản. Kiểm tra thông tin và thử lại.';
      }
    } catch { this.error = 'Không thể tạo tài khoản. Vui lòng thử lại.'; }
    finally { this.submitting = false; }
  }
}
