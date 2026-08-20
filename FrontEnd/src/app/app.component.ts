import { Component } from '@angular/core';
import { environment } from './../environments/environment';
import { clearItem } from './service/localstorage';

@Component({
  standalone: false,
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent {
   public urlBase = "";
   constructor() {
      this.urlBase = environment.apiUrl;
   }

}
