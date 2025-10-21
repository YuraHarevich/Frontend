// services/postService.ts
import api, { toggleLike as apiToggleLike, addComment as apiAddComment } from './api';
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

  // Переключение лайка (лайк/анлайк одним эндпоинтом)
  toggleLike: async (postId: string, userId: string): Promise<any> => {
    console.log('postService: Toggling like for post', { postId, userId });
    const response = await apiToggleLike(postId, userId);
    console.log('postService: Toggle like response', response.data);
    return response.data;
  },

  // Добавление комментария
  addComment: async (postId: string, text: string, posterId: string): Promise<any> => {
    console.log('postService: Adding comment', { postId, text, posterId });
    const response = await apiAddComment(text, posterId, postId);
    console.log('postService: Comment response', response.data);
    return response.data;
  },

  // Получение постов автора
  getPostsByAuthor: async (username: string, params: GetPostsRequest = {}): Promise<PostsResponse> => {
    const response = await api.get(`/api/v1/posts/author/${username}`, { 
      params: {
        pageNumber: params.page || 0,
        size: params.size || 10
      }
    });
    return response.data;
  },

  // Создание нового поста
  // services/postService.ts
  createPost: async (text: string, author: string, authorId: string, files: File[]): Promise<any> => {
    const formData = new FormData();
    
    // Создаем объект для body части
    const bodyData = {
      text,
      author,
      authorId
    };
    
    // Добавляем body как Blob с правильным Content-Type
    const bodyBlob = new Blob([JSON.stringify(bodyData)], { 
      type: 'application/json' 
    });
    formData.append('body', bodyBlob);
    
    // Добавляем файлы
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Отладочная информация
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `File: ${value.name}` : value);
    }

    try {
      const response = await api.post('/api/v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
};