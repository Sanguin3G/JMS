import { Directive, ElementRef, HostListener, inject } from '@angular/core';
@Directive({ selector: 'img[jmsImageFallback]', standalone: true })
export class ImageFallbackDirective {
  private readonly image = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private failed = false;
  @HostListener('error') onError(): void {
    if (!this.failed) { this.failed = true; this.image.src = '/assets/images/avatar.svg'; }
  }
}
