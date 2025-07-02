import { 
  CommentCreateRequest, 
  CommentUpdateRequest, 
  CommentDeleteRequest, 
  CommentResponse, 
  CommentPageResponse 
} from '@/types/comment';
import { api } from './axios';

// 댓글 작성
export const createComment = async (placeId: string, data: CommentCreateRequest): Promise<CommentResponse> => {
  const response = await api.post(`/api/places/${placeId}/comments`, data);
  return response.data;
};

// 댓글 목록 조회
export const getComments = async (placeId: string, page: number = 0, size: number = 5): Promise<CommentPageResponse> => {
  const response = await api.get(`/api/places/${placeId}/comments`, {
    params: { page, size }
  });
  return response.data;
};

// 댓글 수 조회
export const getCommentCount = async (placeId: string): Promise<number> => {
  const response = await api.get(`/api/places/${placeId}/comments/count`);
  return response.data.count;
};

// 댓글 수정
export const updateComment = async (placeId: string, commentId: string, data: CommentUpdateRequest): Promise<CommentResponse> => {
  const response = await api.put(`/api/places/${placeId}/comments/${commentId}`, data);
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (placeId: string, commentId: string, data: CommentDeleteRequest): Promise<void> => {
  await api.delete(`/api/places/${placeId}/comments/${commentId}`, { data });
}; 