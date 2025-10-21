export interface Comment {
  id: string;
  payload: string;
  posterId: string;
  posterName: string;
  postId: string;
  createdAt: string;
  leavedAt: string;
  avatar?: string; // base64 avatar image (data without prefix)
}

export interface PageableResponse<T> {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  content: T[];
}

export interface CommentsResponse extends PageableResponse<Comment> {}

export interface GetCommentsRequest {
  id: string; // UUID of the post
  page_number?: number;
  size?: number;
}
