// 댓글 작성 요청
export interface CommentCreateRequest {
  nickname: string;
  password: string;
  content: string;
  parentId?: string;
}

// 댓글 수정 요청
export interface CommentUpdateRequest {
  password: string;
  content: string;
}

// 댓글 삭제 요청
export interface CommentDeleteRequest {
  password: string;
}

// 댓글 응답
export interface CommentResponse {
  id: string;
  placeId: string;
  parentId?: string;
  nickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  replies: CommentResponse[];
}

// 댓글 페이지 응답
export interface CommentPageResponse {
  content: CommentResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
} 