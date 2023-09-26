import {RedditPost} from "./reddit-post.model";

export interface RedditResponse {
  data: RedditResponseData;
}

export interface RedditResponseData {
  children: RedditPost[];
}
