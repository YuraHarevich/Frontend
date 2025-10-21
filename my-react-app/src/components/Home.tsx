// components/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { getUserInfo } from '../services/api';
import { Icon } from './Icon';
import { iconService } from '../services/iconService';
import { InlineComments } from './InlineComments';
import type { Post as PostType, PostsResponse } from '../types/post';
import type { User } from '../types/auth';
import '../../styles/home.css';
import '../../styles/inline-comments.css';

interface HomeProps {
  currentUser: User | null;
  onLogout: () => void;
}

export function Home({ currentUser, onLogout }: HomeProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  console.log('Home component - currentUser:', currentUser);
  console.log('Home component - userInfo:', userInfo);

  useEffect(() => {
    loadUserInfo();
    loadPosts();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userResponse = await getUserInfo();
      const userData = userResponse.data;
      setUserInfo(userData);
      console.log('Loaded user info:', userData);
    } catch (err) {
      console.error('Error loading user info:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response: PostsResponse = await postService.getFeed({ page: 0, size: 10 });

      const postsWithLikes: PostType[] = response.content.map((post: PostType) => ({
        ...post,
        isLiked: false
      }));

      // Fetch avatars for authors
      const authorIds: string[] = postsWithLikes
        .map(p => p.authorId)
        .filter((id): id is string => Boolean(id));

      let avatarsByParentId: Record<string, string> = {};
      if (authorIds.length > 0) {
        try {
          const imagesResponse = await iconService.getImagesByParentIds(Array.from(new Set(authorIds)));
          avatarsByParentId = (imagesResponse.content || []).reduce((acc: Record<string, string>, item) => {
            const firstFile = item.files && item.files.length > 0 ? item.files[0].file : undefined;
            if (firstFile) {
              acc[item.parentId] = firstFile;
            }
            return acc;
          }, {});
        } catch (e) {
          // If avatars fetch fails, keep fallback initials
          console.warn('Failed to load avatars', e);
        }
      }

      const postsWithAvatars = postsWithLikes.map(p => ({
        ...p,
        avatar: p.authorId ? avatarsByParentId[p.authorId] : undefined
      }));

      setPosts(postsWithAvatars);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const effectiveUser = userInfo || currentUser;
      console.log('Handling like toggle:', { postId, effectiveUser });
      const post = posts.find(p => p.id === postId);
      if (!post || !effectiveUser?.id) {
        console.log('Missing post or user ID:', { post, userId: effectiveUser?.id });
        return;
      }

      // Сначала обновляем UI
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              numberOfLikes: p.isLiked ? p.numberOfLikes - 1 : p.numberOfLikes + 1
            }
          : p
      ));

      // Затем отправляем запрос на переключение лайка
      console.log('Toggling like for post');
      await postService.toggleLike(postId, effectiveUser.id);
    } catch (err) {
      console.error('Error toggling like:', err);
      // В случае ошибки откатываем изменения
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              numberOfLikes: p.isLiked ? p.numberOfLikes + 1 : p.numberOfLikes - 1
            }
          : p
      ));
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      const effectiveUser = userInfo || currentUser;
      console.log('Adding comment:', { postId, text, userId: effectiveUser?.id });
      if (!effectiveUser?.id) {
        console.log('No user ID available for comment');
        return;
      }
      
      // Сначала обновляем UI
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              numberOfComments: post.numberOfComments + 1
            }
          : post
      ));
      
      // Затем отправляем запрос
      await postService.addComment(postId, text, effectiveUser.id);
      console.log('Comment added successfully');
      
      // Обновляем комментарии для всех постов с открытыми комментариями
      setPosts(prev => prev.map(post => ({
        ...post,
        refreshComments: post.id === postId ? Date.now() : post.refreshComments
      })));
    } catch (err) {
      console.error('Error adding comment:', err);
      // В случае ошибки откатываем изменения
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              numberOfComments: post.numberOfComments - 1
            }
          : post
      ));
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <Header onLogout={onLogout} />
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Header onLogout={onLogout} />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header onLogout={onLogout} />
      
      <main className="home-main">
        <div className="posts-container">
          {posts.map((post: PostType) => (
            <PostComponent
              key={post.id}
              post={post}
              currentUser={userInfo || currentUser}
              onLike={handleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// Header компонент с использованием Icon
function Header({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleNavigateToMessages = () => {
    console.log('Navigate to messages');
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="home-header">
      <div className="header-content">
        <h1 className="logo">Instantgram</h1>
        
        <nav className="header-nav">
          <button className="nav-button active" title="Home">
            <Icon name="home" />
          </button>
          <button onClick={handleNavigateToMessages} className="nav-button" title="Messages">
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

interface PostComponentProps {
  post: PostType;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

function PostComponent({ post, currentUser, onLike, onAddComment }: PostComponentProps) {
  const [showComments, setShowComments] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Загружаем аватар пользователя
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (currentUser?.id) {
        try {
          const imagesResponse = await iconService.getImagesByParentIds([currentUser.id]);
          if (imagesResponse.content && imagesResponse.content.length > 0) {
            const firstFile = imagesResponse.content[0].files && imagesResponse.content[0].files.length > 0 
              ? imagesResponse.content[0].files[0].file 
              : undefined;
            if (firstFile) {
              setUserAvatar(firstFile);
            }
          }
        } catch (e) {
          console.warn('Failed to load user avatar', e);
        }
      }
    };
    loadUserAvatar();
  }, [currentUser?.id]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting comment:', { postId: post.id, text: newComment, currentUser: currentUser });
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

  return (
    <div className="post">
      {/* Post Header */}
      <div className="post-header">
        <div className="user-avatar">
          {post.avatar ? (
            <img src={`data:image/jpeg;base64,${post.avatar}`} alt={`${post.author} avatar`} />
          ) : (
            <span>{post.author?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
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
              <Icon name="chevron-left" width={20} height={20} />
            </button>
            <button 
              className="image-nav-button next" 
              onClick={nextImage}
            >
              <Icon name="chevron-right" width={20} height={20} />
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
            onClick={() => {
              console.log('Like button clicked for post:', post.id);
              onLike(post.id);
            }}
            className={`action-button ${post.isLiked ? 'liked' : ''}`}
          >
            <Icon name={post.isLiked ? "heart-filled" : "heart"} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="action-button"
          >
            <Icon name="message-circle" />
          </button>
          <button className="action-button">
            <Icon name="send" />
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

        {/* View Comments Button */}
        {!showInlineComments && post.numberOfComments > 0 && (
          <button
            onClick={() => setShowInlineComments(true)}
            className="view-comments-button"
          >
            View all {post.numberOfComments} comments
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            <form onSubmit={handleSubmitComment} className="add-comment-form">
              <div className="comment-avatar">
                {userAvatar ? (
                  <img src={`data:image/jpeg;base64,${userAvatar}`} alt={`${currentUser?.username} avatar`} />
                ) : (
                  <span>{currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
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
                onClick={(e) => {
                  console.log('Comment button clicked');
                  if (!newComment.trim()) {
                    e.preventDefault();
                    console.log('Comment is empty, preventing submit');
                  }
                }}
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Inline Comments */}
      {showInlineComments && (
        <InlineComments
          postId={post.id}
          isVisible={showInlineComments}
          refreshKey={post.refreshComments}
        />
      )}
    </div>
  );
}