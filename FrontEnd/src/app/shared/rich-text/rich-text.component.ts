import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CKEditorModule, ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, type EditorConfig } from 'ckeditor5';
import viTranslations from 'ckeditor5/translations/vi.js';
import { I18nService } from 'src/app/core/i18n/i18n.service';

/** Recreate only the editor when its UI language changes; the form draft stays intact. */
@Component({
 selector:'jms-rich-text', standalone:true, imports:[CKEditorModule],
 providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>RichTextComponent),multi:true}],
 template:`@if(i18n.language()==='vi') {
   <ckeditor [editor]="editor" [config]="localizedConfig()" [data]="value" [disabled]="disabled" (change)="changed($event)" (blur)="onTouched()"></ckeditor>
 } @else {
   <ckeditor [editor]="editor" [config]="localizedConfig()" [data]="value" [disabled]="disabled" (change)="changed($event)" (blur)="onTouched()"></ckeditor>
 }`,
 styles:[`:host{display:block}`]
})
export class RichTextComponent implements ControlValueAccessor {
 readonly i18n=inject(I18nService);
 readonly config=input<EditorConfig>({});
 readonly editor=ClassicEditor;
 readonly localizedConfig=computed(()=>({
  ...this.config(),language:this.i18n.language(),
  translations:this.i18n.language()==='vi'?[viTranslations]:undefined,
  placeholder:this.i18n.t(this.config().placeholder)
 }));
 value='';disabled=false;
 private onChange:(value:string)=>void=()=>{};
 onTouched:()=>void=()=>{};
 writeValue(value:unknown):void{this.value=typeof value==='string'?value:'';}
 registerOnChange(fn:(value:string)=>void):void{this.onChange=fn;}
 registerOnTouched(fn:()=>void):void{this.onTouched=fn;}
 setDisabledState(disabled:boolean):void{this.disabled=disabled;}
 changed(event:ChangeEvent):void{const value=event.editor.getData();if(value!==this.value){this.value=value;this.onChange(value);}}
}
