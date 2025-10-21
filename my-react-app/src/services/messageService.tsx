import api from './api';
import type { 
  MessagesResponse, 
  ChatsResponse, 
  GetMessagesRequest, 
  GetChatsRequest, 
  SendMessageRequest 
} from '../types/message';

export const messageService = {
  // Получение списка чатов
  getChats: async (params: GetChatsRequest = {}): Promise<ChatsResponse> => {
    const response = await api.get('/api/v1/messages/chats', {
      params: {
        page_number: params.page_number || 0,
        size: params.size || 20
      }
    });
    return response.data;
  },

  // Получение сообщений чата
  getMessages: async (params: GetMessagesRequest): Promise<MessagesResponse> => {
    const response = await api.get('/api/v1/messages', {
      params: {
        chatId: params.chatId,
        page_number: params.page_number || 0,
        size: params.size || 50
      }
    });
    return response.data;
  },

  // Отправка сообщения
  sendMessage: async (data: SendMessageRequest): Promise<any> => {
    const response = await api.post('/api/v1/messages', data);
    return response.data;
  },

  // Создание нового чата
  createChat: async (participantId: string): Promise<any> => {
    const response = await api.post('/api/v1/messages/chats', {
      participantId
    });
    return response.data;
  },

  // Отметить сообщения как прочитанные
  markAsRead: async (chatId: string): Promise<any> => {
    const response = await api.put(`/api/v1/messages/chats/${chatId}/read`);
    return response.data;
  }
};
