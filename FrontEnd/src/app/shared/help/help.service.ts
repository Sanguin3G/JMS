import { Injectable,inject } from '@angular/core';
import {Dialog} from '@angular/cdk/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {HelpDrawerComponent} from './help-drawer.component';
@Injectable({providedIn:'root'})
export class HelpService{
 private readonly dialog=inject(Dialog);
 private readonly overlay=inject(Overlay);
 open():void{if(this.dialog.getDialogById('jms-help'))return;this.dialog.open(HelpDrawerComponent,{id:'jms-help',width:'min(600px,100vw)',maxWidth:'100vw',height:'100dvh',positionStrategy:this.overlay.position().global().right('0').top('0'),ariaLabel:'JMS Help',panelClass:'jms-help-panel'});}
}

