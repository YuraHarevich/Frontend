export interface Post {
  id: string;
  text: string;
  author: string;
  numberOfLikes: number;
  numberOfComments: number;
  createdAt: string;
  files: string[];
  isLiked?: boolean;
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