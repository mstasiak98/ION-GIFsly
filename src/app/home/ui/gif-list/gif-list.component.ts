import {ChangeDetectionStrategy, Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {Gif} from "../../../shared/models";

@Component({
  selector: 'app-gif-list',
  templateUrl: './gif-list.component.html',
  styleUrls: ['./gif-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GifListComponent  implements OnInit {

  @Input() gifs!: Gif[];

  constructor() { }

  ngOnInit() {}

  trackByFn(index: number, gif: Gif) {
    return gif.permalink;
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [GifListComponent],
  exports: [GifListComponent]
})
export class GifListComponentModule {}
