import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from 'src/app/core/auth/auth.service';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'jms-auth-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedModule],
  templateUrl: './auth-sign-in.component.html',
  styleUrls: ['./auth-sign-in.component.css'],
})
export class AuthSignInComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly role = this.router.url.split('/')[1] as UserRole;
  readonly roleLabel = { candidate: 'Ứng viên', recruiter: 'Nhà tuyển dụng', admin: 'Quản trị viên' }[this.role];
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(35)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(72)] }),
  });
  showPassword = false;
  submitting = false;
  error = '';
  async submit(): Promise<void> {
    if (this.submitting) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = '';
    try {
      const { username, password } = this.form.getRawValue();
      const profile = await this.auth.signIn(this.role, username.trim(), password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const fallback = this.role === 'recruiter' ? (profile.companyId ? '/recruiter/dashboard' : '/recruiter/create-company') : `/${this.role}`;
      await this.router.navigateByUrl(returnUrl?.startsWith(`/${this.role}/`) ? returnUrl : fallback);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.';
    } finally { this.submitting = false; }
  }
}
