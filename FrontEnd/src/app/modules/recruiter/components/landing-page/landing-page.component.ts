import { Component, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
   selector: 'app-landing-page',
   templateUrl: './landing-page.component.html',
   styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
   URL: any = environment.Url
   mobileNavigationOpen = false;
   scrolled = false;
   scrollingUp = false;
   showScrollTop = false;
   private previousScrollPosition = 0;

   @HostListener('window:scroll')
   onWindowScroll() {
      const currentScrollPosition = window.scrollY;
      this.scrolled = currentScrollPosition > 80;
      this.scrollingUp = this.scrolled && currentScrollPosition < this.previousScrollPosition;
      this.showScrollTop = currentScrollPosition >= 600;
      this.previousScrollPosition = currentScrollPosition;
   }

   toggleMobileNavigation() {
      this.mobileNavigationOpen = !this.mobileNavigationOpen;
   }

   scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }
}
