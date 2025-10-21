export interface Post {
  id: string;
  text: string;
  author: string;
  authorId?: string; // UUID of author if provided by backend
  numberOfLikes: number;
  numberOfComments: number;
  createdAt: string;
  files: string[];
  isLiked?: boolean;
  avatar?: string; // base64 avatar image (data without prefix)
  refreshComments?: number; // timestamp for refreshing comments
}

export interface PostsResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  content: Post[];
}

export interface GetPostsRequest {
  page?: number;
  size?: number;
}