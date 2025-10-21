import api from './api';
import type { CommentsResponse, GetCommentsRequest } from '../types/comment';

export const commentService = {
  // Получение комментариев для поста
  getComments: async (params: GetCommentsRequest): Promise<CommentsResponse> => {
    const response = await api.get('/api/v1/activities/comments', {
      params: {
        id: params.id,
        page_number: params.page_number || 0,
        size: params.size || 20
      }
    });
    return response.data;
  }
};
