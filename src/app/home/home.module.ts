import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {GifListComponentModule} from "./ui/gif-list/gif-list.component";
import {SearchBarComponentModule} from "./ui/search-bar/search-bar.component";
import {SettingsModule} from "../settings/settings.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    GifListComponentModule,
    SearchBarComponentModule,
    SettingsModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
