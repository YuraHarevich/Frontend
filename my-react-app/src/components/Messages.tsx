import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { iconService } from '../services/iconService';
import { Icon } from './Icon';
import type { Chat, Message, User } from '../types/message';
import type { User as AuthUser } from '../types/auth';
import '../../styles/messages.css';

interface MessagesProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export function Messages({ currentUser, onLogout }: MessagesProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await messageService.getChats();
      
      // Загружаем аватары для участников чатов
      const allParticipantIds = response.content
        .flatMap(chat => chat.participants.map(p => p.id))
        .filter((id, index, arr) => arr.indexOf(id) === index);

      let avatarsByParentId: Record<string, string> = {};
      if (allParticipantIds.length > 0) {
        try {
          const imagesResponse = await iconService.getImagesByParentIds(allParticipantIds);
          avatarsByParentId = (imagesResponse.content || []).reduce((acc: Record<string, string>, item) => {
            const firstFile = item.files && item.files.length > 0 ? item.files[0].file : undefined;
            if (firstFile) {
              acc[item.parentId] = firstFile;
            }
            return acc;
          }, {});
        } catch (e) {
          console.warn('Failed to load chat avatars', e);
        }
      }

      const chatsWithAvatars = response.content.map(chat => ({
        ...chat,
        participants: chat.participants.map(participant => ({
          ...participant,
          avatar: avatarsByParentId[participant.id]
        }))
      }));

      setChats(chatsWithAvatars);
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await messageService.getMessages({ chatId });
      
      // Загружаем аватары для отправителей сообщений
      const senderIds = response.content
        .map(msg => msg.senderId)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      let avatarsByParentId: Record<string, string> = {};
      if (senderIds.length > 0) {
        try {
          const imagesResponse = await iconService.getImagesByParentIds(senderIds);
          avatarsByParentId = (imagesResponse.content || []).reduce((acc: Record<string, string>, item) => {
            const firstFile = item.files && item.files.length > 0 ? item.files[0].file : undefined;
            if (firstFile) {
              acc[item.parentId] = firstFile;
            }
            return acc;
          }, {});
        } catch (e) {
          console.warn('Failed to load message avatars', e);
        }
      }

      const messagesWithAvatars = response.content.map(message => ({
        ...message,
        avatar: avatarsByParentId[message.senderId]
      }));

      setMessages(messagesWithAvatars);
      
      // Отмечаем сообщения как прочитанные
      await messageService.markAsRead(chatId);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      await messageService.sendMessage({
        chatId: selectedChat.id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      // Перезагружаем сообщения
      loadMessages(selectedChat.id);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.id !== currentUser?.id);
  };

  if (loading) {
    return (
      <div className="messages-container">
        <Header onLogout={onLogout} />
        <div className="messages-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <Header onLogout={onLogout} />
      
      <div className="messages-content">
        {/* Chats List */}
        <div className="chats-sidebar">
          <div className="chats-header">
            <h2>Messages</h2>
            <button className="new-chat-button">
              <Icon name="edit" width={20} height={20} />
            </button>
          </div>
          
          <div className="chats-list">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              return (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-avatar">
                    {otherParticipant?.avatar ? (
                      <img src={`data:image/jpeg;base64,${otherParticipant.avatar}`} alt={`${otherParticipant.username} avatar`} />
                    ) : (
                      <span>{otherParticipant?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="chat-content">
                    <div className="chat-header">
                      <span className="chat-username">{otherParticipant?.username}</span>
                      <span className="chat-time">{chat.lastMessage ? formatDate(chat.lastMessage.createdAt) : ''}</span>
                    </div>
                    <p className="chat-last-message">{chat.lastMessage?.content || 'No messages yet'}</p>
                    {chat.unreadCount > 0 && (
                      <div className="unread-badge">{chat.unreadCount}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {selectedChat ? (
            <>
              <div className="messages-header">
                <div className="messages-user-info">
                  <div className="messages-avatar">
                    {getOtherParticipant(selectedChat)?.avatar ? (
                      <img src={`data:image/jpeg;base64,${getOtherParticipant(selectedChat)?.avatar}`} alt={`${getOtherParticipant(selectedChat)?.username} avatar`} />
                    ) : (
                      <span>{getOtherParticipant(selectedChat)?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="messages-username">{getOtherParticipant(selectedChat)?.username}</span>
                </div>
                <button className="messages-options">
                  <Icon name="more-horizontal" width={20} height={20} />
                </button>
              </div>

              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-item ${message.senderId === currentUser?.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-avatar">
                      {message.avatar ? (
                        <img src={`data:image/jpeg;base64,${message.avatar}`} alt={`${message.senderName} avatar`} />
                      ) : (
                        <span>{message.senderName?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="message-content">
                      <p className="message-text">{message.content}</p>
                      <span className="message-time">{formatDate(message.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="message-input-container">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="message-input"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={!newMessage.trim() || sending}
                  >
                    <Icon name="send" width={20} height={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">
                <Icon name="message-circle" width={64} height={64} />
              </div>
              <h3>Your Messages</h3>
              <p>Send private photos and messages to a friend or group.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Header компонент
function Header({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="messages-header-nav">
      <div className="header-content">
        <h1 className="logo">Instantgram</h1>
        
        <nav className="header-nav">
          <button onClick={handleNavigateToHome} className="nav-button" title="Home">
            <Icon name="home" />
          </button>
          <button className="nav-button active" title="Messages">
            <Icon name="message-circle" />
          </button>
          <button onClick={handleNavigateToProfile} className="nav-button" title="Profile">
            <Icon name="user" />
          </button>
        </nav>

        <button onClick={onLogout} className="logout-icon-button" title="Logout">
          <Icon name="log-out" width={20} height={20} />
        </button>
      </div>
    </header>
  );
}
