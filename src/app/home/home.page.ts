import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RedditService} from "../shared/data-access/reddit/reddit.service";
import {BehaviorSubject, combineLatest, map} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {

  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  loadedGifs$ = new BehaviorSubject<string[]>([]);

  gifs$ = combineLatest([
    this.redditService.getGifs(),
    this.currentlyLoadingGifs$,
    this.loadedGifs$
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink)
      }))
    )
  );

  constructor(private redditService: RedditService) {}

  setLoading(permalink: string) {
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value,
      permalink
    ]);
  }

  setLoadingComplete(permalinkToComplete: string) {
    this.loadedGifs$.next([
      ...this.loadedGifs$.value,
      permalinkToComplete
    ]);

    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value.filter(
        (permalink) => !this.loadedGifs$.value.includes(permalink)
      )
    ]);
  }
}
