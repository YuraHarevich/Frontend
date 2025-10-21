// services/iconService.ts
import api from './api';
import type { Icon, ImageResponse, PageableResponse } from '../types/icon';

export const iconService = {
  // Получение всех иконок
  getIcons: async (): Promise<Icon[]> => {
    const response = await api.get('/api/v1/images/icons');
    return response.data;
  },

  // Декодирование base64 SVG
  decodeSvg: (base64String: string): string => {
    return atob(base64String);
  },

  // Получение аватарок по списку parent ids (UUID пользователей)
  getImagesByParentIds: async (ids: string[], page: number = 0, size: number = 100): Promise<PageableResponse<ImageResponse>> => {
    const response = await api.get('/api/v1/images/parent/many', {
      params: {
        ids: ids.join(','), // Преобразуем массив в строку через запятую
        page_number: page,
        size: size
      }
    });
    return response.data;
  },

  // Загрузка аватарки
  uploadAvatar: async (parentEntityId: string, file: File): Promise<any> => {
    const formData = new FormData();
    
    // Создаем Blob для imageType
    const imageTypeBlob = new Blob(['AVATAR'], { 
      type: 'text/plain' 
    });
    formData.append('imageType', imageTypeBlob);
    
    // Создаем Blob для parentEntityId
    const parentEntityIdBlob = new Blob([parentEntityId], { 
      type: 'text/plain' 
    });
    formData.append('parentEntityId', parentEntityIdBlob);
    
    // Добавляем файл
    formData.append('file', file);

    const response = await api.post('/api/v1/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};