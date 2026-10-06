import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bearerInterceptor } from './core/http/api.service';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NotificationsComponent } from './shared/notifications/notifications.component';

@NgModule({
   declarations: [
      AppComponent,
      ConfirmDialogComponent,
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      NotificationsComponent,
   ],
   // Legacy NgModule screens still use ordinary fields after async requests.
   // Keep their change detection coherent while touched state moves to signals.
   providers: [provideZoneChangeDetection(), provideHttpClient(withInterceptors([bearerInterceptor]))],
   bootstrap: [AppComponent],
})
export class AppModule { }
