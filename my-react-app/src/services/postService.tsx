// services/postService.ts
import api from './api';
import type {PostsResponse, GetPostsRequest } from '../types/post';

export const postService = {
  // Получение ленты постов
  getFeed: async (params: GetPostsRequest = {}): Promise<PostsResponse> => {
    const response = await api.get('/api/v1/posts/feed', { 
      params: {
        pageNumber: params.page || 0,
        size: params.size || 10
      }
    });
    return response.data;
  },

  // Лайк поста
  likePost: async (postId: string): Promise<any> => {
    const response = await api.post(`/api/v1/posts/${postId}/like`);
    return response.data;
  },

  // Убрать лайк
  unlikePost: async (postId: string): Promise<any> => {
    const response = await api.delete(`/api/v1/posts/${postId}/like`);
    return response.data;
  },

  // Добавление комментария
  addComment: async (postId: string, text: string): Promise<any> => {
    const response = await api.post(`/api/v1/posts/${postId}/comments`, { text });
    return response.data;
  },
};