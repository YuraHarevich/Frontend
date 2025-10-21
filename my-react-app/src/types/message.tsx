export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  chatId: string;
  createdAt: string;
  isRead: boolean;
  avatar?: string; // base64 avatar image (data without prefix)
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  username: string;
  avatar?: string; // base64 avatar image (data without prefix)
}

export interface MessagesResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  content: Message[];
}

export interface ChatsResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  content: Chat[];
}

export interface GetMessagesRequest {
  chatId: string;
  page_number?: number;
  size?: number;
}

export interface GetChatsRequest {
  page_number?: number;
  size?: number;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
}
