import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getRequest, postRequest } from 'src/app/service/api-requests';
import { AuthorizationMode, apiRecruiter } from 'src/app/service/constant';

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
   readonly slides = [
      'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fspinmaster_hrbn.JPG_124709.jpg&w=1920&q=75',
      'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fonpoint_hrbn.JPG_124824.jpg&w=1920&q=75',
      'https://www.vietnamworks.com/_next/image?url=https%3A%2F%2Fimages.vietnamworks.com%2Flogo%2Fbanvien_hrbn_124682.png&w=1920&q=75'
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
      getRequest(apiRecruiter.GET_COMPANY_PAGING, AuthorizationMode.PUBLIC, { page: 1 })
         .then(res => {
            if (res?.statusCode == 200) {
               this.companies = res?.data
               console.log(res?.data);
            }
         })
         .catch(data => {
            console.warn(apiRecruiter.GET_ALL_CATEGORY, data);
         })
   }

}
