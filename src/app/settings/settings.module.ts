import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SettingsComponent } from "./settings.component";
import {SettingsFormComponentModule} from "./ui/settings-form/settings-form.component";



@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SettingsFormComponentModule
  ],
  exports: [SettingsComponent]
})
export class SettingsModule { }
