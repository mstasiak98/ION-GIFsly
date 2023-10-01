import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
  of,
  scan, startWith, switchMap,
  tap, combineLatest, expand
} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Gif, RedditPagination, RedditPost, RedditResponse, Settings} from "../../models";
import {FormControl} from "@angular/forms";
import {SettingsService} from "../settings/settings.service";

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  private pagination$ = new BehaviorSubject<RedditPagination>({
    after: null,
    totalFound: 0,
    retries: 0,
    infiniteScroll: null
  });

  private settings$ = this.settingsService.settings$;

  constructor(private http: HttpClient, private settingsService: SettingsService) { }


  getGifs(subredditFormControl: FormControl): Observable<Gif[]> {

    const subreddit$ = subredditFormControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(subredditFormControl.value),
      // Reset pagination when subreddit changes
      tap(() => {
        this.pagination$.next({
          after: null,
          totalFound: 0,
          retries: 0,
          infiniteScroll: null
        });
      })
    );

    return combineLatest([subreddit$, this.settings$]).pipe(

      // Switch map because I want fresh stream of gifs for subreddits
      switchMap(([subreddit, settings]) => {

        // Fetch gifs for current page
        const gifsForCurrentPage$ = this.pagination$.pipe(
          // tap((pagination)=> {
          //   pagination?.infiniteScroll?.complete();
          // }),
          concatMap((pagination) =>
            this.fetchPostsFromReddit(
              subreddit as string,
              settings.sort,
              pagination.after,
              settings.perPage
            ).pipe(
              // Keep retrying until enough gifs to fill a page
              // will keep repeating as long as it returns non-empty observable
              expand((res, index) => {
                const validGifs = res.gifs.filter((gif) => gif.src !== null);
                const gifsRequired = res.gifsRequired - validGifs.length;
                const maxAttempts = 10;

                // Conditions needs to be met to keep retrying:
                // - need more gifs
                // - atleast one gif from api
                // - havent exceeded the max retries
                const shouldKeepTrying =
                  gifsRequired > 0 && res.gifs.length && index < maxAttempts;

                  if(!shouldKeepTrying) {
                     pagination?.infiniteScroll?.complete();
                  }

                  return shouldKeepTrying ?
                    this.fetchPostsFromReddit(
                      subreddit as string,
                      settings.sort,
                      res.gifs[res.gifs.length - 1].name,
                      gifsRequired
                    )
                    : EMPTY  // return empty to stop expand retrying
              })
            )
          ),
          map((res) =>
            res.gifs.filter((gif) => gif.src !== null).slice(0, res.gifsRequired)
          )
        );

        // Every time a new page is fetched, add it to cached gifs
        const allGifs = gifsForCurrentPage$.pipe(
          scan((previousGifs, currentGifs) => [...previousGifs, ...currentGifs])
        );

        return allGifs;
      })
    )
  }

  nextPage(infiniteScrollEvent: Event, after: string) {
    this.pagination$.next({
      after,
      totalFound: 0,
      retries: 0,
      infiniteScroll: infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement
    });
  }

  private fetchPostsFromReddit(
    subreddit: string,
    sort: string,
    after: string | null,
    gifsRequired: number
  ): Observable<{gifs: Gif[], gifsRequired: number }> {
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=100` +
              (after ? `&after=${after}`: '')
      )
      .pipe(
        // If error return empty observable
        // Prevents stream from breaking
        catchError(() => EMPTY),
        // Convert posts response to gif format
        map((res) => ({
          gifs: this.convertRedditPostToGif(res.data.children),
          gifsRequired
        }))
      )
  }

  private convertRedditPostToGif(posts: RedditPost[]): Gif[] {
    return posts.map((post) => ({
      src: this.getBestSrcForGif(post),
      author: post.data.author,
      name: post.data.name,
      permalink: post.data.permalink,
      title: post.data.title,
      thumbnail: post.data.thumbnail,
      comments: post.data.num_comments,
      loading: false,
    }))
      .filter((gif) => gif.src !== null);
  }

  private getBestSrcForGif(post: RedditPost): string | null {

    //If post source is mp4 leave it as it is
    if(post.data.url.indexOf('.mp4') > -1) return post.data.url;

    //If source is .gifv or .webm formats, convert to mp4
    if(post.data.url.indexOf('.gifv') > -1)
      return post.data.url.replace('.gifv', '.mp4');

    if(post.data.url.indexOf('.webm') > -1)
      return post.data.url.replace('.webm', '.mp4');

    // If url is not mp4, gifv or webm, then check if media or secure media available
    if(post.data.secure_media?.reddit_video)
      return post.data.secure_media.reddit_video.fallback_url;

    if(post.data.media?.reddit_video)
      return post.data.media.reddit_video.fallback_url;

    // If media not available check for preview availability
    if(post.data.preview?.reddit_video_preview)
      return post.data.preview.reddit_video_preview.fallback_url;

    // No usable formats for gif available
    return null;
  }
}
