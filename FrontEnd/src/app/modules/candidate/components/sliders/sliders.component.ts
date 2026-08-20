import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getRequest } from 'src/app/service/api-requests';
import { apiCandidate, AuthorizationMode, apiRecruiter } from 'src/app/service/constant';

interface CarouselSlide {
   title: string;
   url: string;
}

@Component({
  standalone: false,
   selector: 'candidate-sliders',
   templateUrl: './sliders.component.html',
   styleUrls: ['./sliders.component.css']
})
export class SlidersComponent {
   Url = environment.Url;
   companies: any;
   activeSlide = 0;
   slides: CarouselSlide[] = [
      { title: 'Featured company', url: 'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fspinmaster_hrbn.JPG_124709.jpg&w=1920&q=75' },
      { title: 'Featured company', url: 'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fonpoint_hrbn.JPG_124824.jpg&w=1920&q=75' },
      { title: 'Featured company', url: 'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fbanvien_hrbn_124682.png&w=1920&q=75' }
   ];

   @ViewChild('companyScroller') private companyScroller?: ElementRef<HTMLUListElement>;

   previousSlide() {
      this.activeSlide = (this.activeSlide + this.slides.length - 1) % this.slides.length;
   }

   nextSlide() {
      this.activeSlide = (this.activeSlide + 1) % this.slides.length;
   }

   selectSlide(index: number) {
      this.activeSlide = index;
   }

   scrollCompanies(direction: 1 | -1) {
      this.companyScroller?.nativeElement.scrollBy({
         left: direction * 250,
         behavior: 'smooth'
      });
   }

   constructor() {
      this.loadSlides();
      this.loadCompanies();
   }

   private loadSlides() {
      getRequest(apiCandidate.GET_ALL_SLIDERS, AuthorizationMode.PUBLIC)
         .then(res => {
            const slides = res?.data
               ?.filter((slide: any) => typeof slide?.url === 'string' && slide.url.length > 0)
               .map((slide: any) => ({
                  title: slide.title || 'Featured company',
                  url: slide.url
               } as CarouselSlide));

            if (res?.statusCode === 200 && slides?.length) {
               this.slides = slides;
               this.activeSlide = 0;
            }
         })
         .catch(error => console.warn('Unable to load featured slides.', error));
   }

   private loadCompanies() {
      getRequest(apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: 1 })
         .then(res => {
            if (res?.statusCode == 200) {
               this.companies = res?.data
            }
         })
         .catch(error => console.warn('Unable to load companies.', error));
   }

}
