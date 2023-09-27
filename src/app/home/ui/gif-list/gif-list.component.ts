import {ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, OnInit, Output} from '@angular/core';
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

  @Output() gifLoadStart = new EventEmitter<string>();
  @Output() gifLoadComplete = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

  playVideo(event: Event, gif: Gif) {
    const video = event.target as HTMLVideoElement;

    if(video.readyState === 4) {
      if(video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }else {
      if(video.getAttribute('data-event-loadeddata') !== 'true') {
        this.gifLoadStart.next(gif.permalink);
        video.load();

        const handleVideoLoaded = async () => {
          this.gifLoadComplete.next(gif.permalink);
          await video.play();
          video.removeEventListener('loadeddata', handleVideoLoaded);
        };

        video.addEventListener('loadeddata', handleVideoLoaded);
        video.setAttribute('data-event-loadeddata', 'true');
      }
    }
  }

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
