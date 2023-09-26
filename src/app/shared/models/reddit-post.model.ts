export interface RedditPost {
  data: RedditPostData;
}

export interface RedditPostData {
  author: string;
  name: string;
  permalink: string;
  preview: RedditPreview;
  secure_media: RedditMedia;
  title: string;
  media: RedditMedia;
  url: string;
  thumbnail: string;
  num_comments: number;
}

export interface RedditPreview {
  reddit_video_preview: RedditVideoPreview;
}

export interface RedditVideoPreview {
  is_gif: boolean;
  fallback_url: string;
}

export interface RedditMedia {
  reddit_video: RedditVideoPreview
}
