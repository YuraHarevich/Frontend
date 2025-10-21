// components/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { iconService } from '../services/iconService';
import { getUserInfo } from '../services/api';
import { Icon } from './Icon';
import { CreatePostModal } from './CreatePostModal';
import { AvatarUploadModal } from './AvatarUploadModal';
import type { Post as PostType, PostsResponse } from '../types/post';
import type { User } from '../types/auth';
import '../../styles/profile.css';

interface ProfileProps {
  currentUser: User;
  onLogout: () => void;
}

export function Profile({ currentUser, onLogout }: ProfileProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAvatarUploadModalOpen, setIsAvatarUploadModalOpen] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const userResponse = await getUserInfo();
      const userData = userResponse.data;
      setUserInfo(userData);
      
      const response: PostsResponse = await postService.getPostsByAuthor(userData.username);
      
      const postsWithLikes: PostType[] = response.content.map((post: PostType) => ({
        ...post,
        isLiked: false
      }));

      // Загружаем аватар пользователя
      try {
        const imagesResponse = await iconService.getImagesByParentIds([userData.id]);
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

      setPosts(postsWithLikes);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handlePostCreated = () => {
    // Перезагружаем посты после создания нового
    loadUserProfile();
  };

  const handleAvatarUploaded = () => {
    // Перезагружаем профиль после загрузки аватарки
    loadUserProfile();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header onLogout={onLogout} />
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Header onLogout={onLogout} />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header onLogout={onLogout} />
      
      <main className="profile-main">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div 
              className="profile-avatar clickable"
              onClick={() => setIsAvatarUploadModalOpen(true)}
              title="Click to upload avatar"
            >
              {userAvatar ? (
                <img src={`data:image/jpeg;base64,${userAvatar}`} alt={`${userInfo?.username || currentUser.username} avatar`} />
              ) : (
                <span>{(userInfo?.username || currentUser.username).charAt(0).toUpperCase()}</span>
              )}
              <div className="avatar-overlay">
                <Icon name="camera" width={24} height={24} />
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-username-section">
                <h1 className="profile-username">{userInfo?.username || currentUser.username}</h1>
                <div className="profile-actions">
                  <button 
                    className="create-post-button"
                    onClick={() => setIsCreatePostModalOpen(true)}
                  >
                    <Icon name="plus" width={16} height={16} />
                    <span>Create Post</span>
                  </button>
                  <button className="edit-profile-button">Edit Profile</button>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">posts</span>
                </div>
              </div>
              
              <div className="profile-details">
                <p className="profile-name">{userInfo?.firstname || currentUser.firstname} {userInfo?.lastname || currentUser.lastname}</p>
                {userInfo?.birthDate && (
                  <p className="profile-birthdate">Born {formatDate(userInfo.birthDate)} ({calculateAge(userInfo.birthDate)} years old)</p>
                )}
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="posts-section">
            <div className="posts-tabs">
              <button className="tab-button active">
                <Icon name="grid" />
                <span>POSTS</span>
              </button>
            </div>
            
            {posts.length > 0 ? (
              <div className="posts-grid">
                {posts.map((post: PostType) => (
                  <PostGridItem
                    key={post.id}
                    post={post}
                  />
                ))}
              </div>
            ) : (
              <div className="no-posts">
                <div className="no-posts-icon">
                  <Icon name="camera" width={48} height={48} />
                </div>
                <h3>No Posts Yet</h3>
                <p>When you share photos and videos, they'll appear on your profile.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentUser={userInfo || currentUser}
      />

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarUploadModalOpen}
        onClose={() => setIsAvatarUploadModalOpen(false)}
        onAvatarUploaded={handleAvatarUploaded}
        currentUser={userInfo || currentUser}
      />
    </div>
  );
}

// Header компонент (аналогичный Home)
function Header({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/home');
  };

  const handleNavigateToMessages = () => {
    console.log('Navigate to messages');
  };

  const handleNavigateToProfile = () => {
    console.log('Already on profile');
  };

  return (
    <header className="profile-header-nav">
      <div className="header-content">
        <h1 className="logo">Instantgram</h1>
        
        <nav className="header-nav">
          <button onClick={handleNavigateToHome} className="nav-button" title="Home">
            <Icon name="home" />
          </button>
          <button onClick={handleNavigateToMessages} className="nav-button" title="Messages">
            <Icon name="message-circle" />
          </button>
          <button onClick={handleNavigateToProfile} className="nav-button active" title="Profile">
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

interface PostGridItemProps {
  post: PostType;
}

function PostGridItem({ post }: PostGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="post-grid-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={`data:image/jpeg;base64,${post.files[0]}`} 
        alt={`Post by ${post.author}`}
        className="post-grid-image"
      />
      
      {isHovered && (
        <div className="post-grid-overlay">
          <div className="overlay-stats">
            <div className="overlay-stat">
              <Icon name="heart" />
              <span>{post.numberOfLikes}</span>
            </div>
            <div className="overlay-stat">
              <Icon name="message-circle" />
              <span>{post.numberOfComments}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
