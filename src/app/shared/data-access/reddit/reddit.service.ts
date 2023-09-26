import { Injectable } from '@angular/core';
import {catchError, EMPTY, map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Gif, RedditPost, RedditResponse} from "../../models";

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  constructor(private http: HttpClient) { }


  getGifs() {
    return this.fetchPostsFromReddit('gifs');

  }

  private fetchPostsFromReddit(subreddit: string): Observable<Gif[]> {
    return this.http
      .get<RedditResponse>(`https://www.reddit.com/r/${subreddit}/hot/.json?limit=100`)
      .pipe(
        catchError(() => EMPTY),
        map((res) => this.convertRedditPostToGif(res.data.children))
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
