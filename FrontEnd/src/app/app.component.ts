import { Component } from '@angular/core';
import { environment } from './../environments/environment';
import { clearItem } from './service/localstorage';
import { ThemeService } from './core/theme/theme.service';

@Component({
  standalone: false,
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent {
   public urlBase = "";
   constructor(_theme: ThemeService) {
      this.urlBase = environment.apiUrl;
   }

}
