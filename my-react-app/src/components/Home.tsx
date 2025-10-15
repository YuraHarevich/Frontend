// components/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import type { Post as PostType, PostsResponse } from '../types/post';
import '../../styles/home.css';

interface HomeProps {
  currentUser: any;
  onLogout: () => void;
}

// SVG иконки (остаются без изменений)
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const SendIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const HomeIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MessagesIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export function Home({ currentUser, onLogout }: HomeProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response: PostsResponse = await postService.getFeed({ page: 0, size: 10 });
      
      // Добавляем флаг isLiked к каждому посту с правильной типизацией
      const postsWithLikes: PostType[] = response.content.map((post: PostType) => ({
        ...post,
        isLiked: false // По умолчанию не лайкнуто
      }));
      
      setPosts(postsWithLikes);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              numberOfLikes: p.isLiked ? p.numberOfLikes - 1 : p.numberOfLikes + 1
            }
          : p
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      await postService.addComment(postId, text);
      
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              numberOfComments: post.numberOfComments + 1
            }
          : post
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <Header currentUser={currentUser} onLogout={onLogout} />
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Header currentUser={currentUser} onLogout={onLogout} />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header currentUser={currentUser} onLogout={onLogout} />
      
      <main className="home-main">
        <div className="posts-container">
          {posts.map((post: PostType) => (
            <PostComponent
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// Header компонент
function Header({ currentUser, onLogout }: { currentUser: any; onLogout: () => void }) {
  const navigate = useNavigate();

  const handleNavigateToMessages = () => {
    console.log('Navigate to messages');
  };

  const handleNavigateToProfile = () => {
    console.log('Navigate to profile');
  };

  return (
    <header className="home-header">
      <div className="header-content">
        <h1 className="logo">Instantgram</h1>
        
        <nav className="header-nav">
          <button className="nav-button active" title="Home">
            <HomeIcon />
          </button>
          <button onClick={handleNavigateToMessages} className="nav-button" title="Messages">
            <MessagesIcon />
          </button>
          <button onClick={handleNavigateToProfile} className="nav-button" title="Profile">
            <UserIcon />
          </button>
        </nav>

        <button onClick={onLogout} className="logout-icon-button" title="Logout">
          <LogOutIcon />
        </button>
      </div>
    </header>
  );
}

interface PostComponentProps {
  post: PostType;
  currentUser: any;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

function PostComponent({ post, currentUser, onLike, onAddComment }: PostComponentProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment('');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === post.files.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? post.files.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    } else {
      return `${diffInYears}y ago`;
    }
  };

  return (
    <div className="post">
      {/* Post Header */}
      <div className="post-header">
        <div className="user-avatar">
          <span>{post.author?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div className="user-info">
          <p className="username">{post.author}</p>
          <p className="timestamp">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Images with Navigation */}
      <div className="post-image-container">
        <div className="post-image">
          {post.files && post.files.length > 0 && (
            <img 
              src={`data:image/jpeg;base64,${post.files[currentImageIndex]}`} 
              alt={`Post by ${post.author}`} 
            />
          )}
        </div>
        
        {/* Navigation Arrows */}
        {post.files && post.files.length > 1 && (
          <>
            <button 
              className="image-nav-button prev" 
              onClick={prevImage}
            >
              <ChevronLeftIcon />
            </button>
            <button 
              className="image-nav-button next" 
              onClick={nextImage}
            >
              <ChevronRightIcon />
            </button>
            
            {/* Image Indicators */}
            <div className="image-indicators">
              {post.files.map((_: string, index: number) => (
                <div 
                  key={index}
                  className={`image-indicator ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <div className="actions-row">
          <button 
            onClick={() => onLike(post.id)}
            className={`action-button ${post.isLiked ? 'liked' : ''}`}
          >
            <HeartIcon filled={post.isLiked} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="action-button"
          >
            <MessageCircleIcon />
          </button>
          <button className="action-button">
            <SendIcon />
          </button>
        </div>

        {/* Likes Count */}
        <p className="likes-count">
          {post.numberOfLikes.toLocaleString()} likes
        </p>

        {/* Caption */}
        {post.text && (
          <p className="caption">
            <span className="caption-username">{post.author}</span>
            {post.text}
          </p>
        )}

        {/* View Comments Button - показывается всегда если есть комментарии */}
        {post.numberOfComments > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="view-comments-button"
          >
            {showComments ? 'Hide comments' : `View all ${post.numberOfComments} comments`}
          </button>
        )}

        {/* Comments Section - показывается только при клике */}
        {showComments && (
          <div className="comments-section">
            {/* Здесь позже будут загружаться комментарии */}
            <div className="comments-placeholder">
              Comments will be loaded here...
            </div>
            
            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="add-comment-form">
              <div className="comment-avatar">
                <span>{currentUser.username?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              />
              <button
                type="submit"
                className="post-comment-button"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>
          </div>
        )}

        {/* Если комментариев нет, показываем форму для добавления первого комментария */}
        {!showComments && post.numberOfComments === 0 && (
          <form onSubmit={handleSubmitComment} className="add-comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button
              type="submit"
              className="post-comment-button"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}