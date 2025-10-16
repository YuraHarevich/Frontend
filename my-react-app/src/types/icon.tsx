export interface Icon {
  file: string;
  name: string;
}

export interface IconsResponse {
  [key: string]: Icon[];
}

// Image API shared types
export interface FileTransferEntity {
  file: string; // base64
  name: string;
}

export interface ImageResponse {
  imageType: string; // backend enum as string
  files: FileTransferEntity[];
  parentId: string; // UUID
}

export interface PageableResponse<T> {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  content: T[];
}