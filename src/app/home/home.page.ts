import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RedditService} from "../shared/data-access/reddit/reddit.service";
import {BehaviorSubject, combineLatest, map, startWith} from "rxjs";
import {Gif, Settings} from "../shared/models";
import {FormBuilder, FormControl} from "@angular/forms";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {

  subredditFormControl = new FormControl('gifs');

  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  loadedGifs$ = new BehaviorSubject<string[]>([]);

  settingsPopoverIsOpen$ = new BehaviorSubject<boolean>(false);

  gifs$ = combineLatest([
    this.redditService.getGifs(this.subredditFormControl),
    this.currentlyLoadingGifs$,
    this.loadedGifs$
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink)
      } as Gif))
    )
  );

  vm$ = combineLatest([
    this.gifs$.pipe(startWith([])),
    this.settingsPopoverIsOpen$
  ]).pipe(
      map(([gifs, popoverIsOpen]) => ({
        gifs,
        popoverIsOpen
      } as { gifs: Gif[], popoverIsOpen: boolean }))
  );

  constructor(private redditService: RedditService, private fb: FormBuilder) {}

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

  loadMore(ev: Event, currentGifs: Gif[]) {
    this.redditService.nextPage(ev, currentGifs[currentGifs.length - 1].name);
  }
}
