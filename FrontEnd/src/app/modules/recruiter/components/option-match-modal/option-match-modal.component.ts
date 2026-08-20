import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
   selector: 'app-option-match-modal',
   templateUrl: './option-match-modal.component.html',
   styleUrls: ['./option-match-modal.component.css'],
})
//validate data wrong
export class OptionMatchModalComponent {

   hour: number = 24
   minute: number = 0
   data: any = { quantity: 10, intendTime: 1440 }
   isValidForm = true

   constructor(
      public dialogRef: MatDialogRef<OptionMatchModalComponent>) { }

   onNoClick(): void {
      this.dialogRef.close();
   }

   onYesClick(): void {
      if (this.checkFormValid()) {
         this.dialogRef.close(this.data);
      }
   }

   quanControl = new FormControl('', [Validators.required, Validators.min(1)]);
   hourControl = new FormControl('', [Validators.min(0)]);
   minControl = new FormControl('', [Validators.min(0)]);

   getErrorMessageQuantity() {
      if (this.quanControl.hasError('required')) {
         return 'Không thể bỏ trống!'
      }
      if (this.quanControl.hasError('min')) {
         return 'Giá trị phải lớn hơn 0!'
      }
      return
   }

   checkFormValid() {
      this.data.intendTime = this.hour * 60 + this.minute
      if (this.data.quantity <= 0 || this.data.intendTime < 0 || this.hour < 0 || this.minute < 0) {
         return false
      }
      if (this.hour == 0 && this.minute == 0) {
         this.isValidForm = false
         return false
      }
      return true;
   }
}
