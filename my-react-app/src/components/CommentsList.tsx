import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { iconService } from '../services/iconService';
import type { Comment, CommentsResponse } from '../types/comment';

interface CommentsListProps {
  postId: string;
  onClose: () => void;
}

export function CommentsList({ postId, onClose }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async (pageNumber = 0) => {
    try {
      if (pageNumber === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response: CommentsResponse = await commentService.getComments({
        id: postId,
        page_number: pageNumber,
        size: 5
      });

      // Получаем аватары для авторов комментариев
      const authorIds = response.content
        .map(comment => comment.posterId)
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
          console.warn('Failed to load comment avatars', e);
        }
      }

      const commentsWithAvatars = response.content.map(comment => ({
        ...comment,
        avatar: comment.posterId ? avatarsByParentId[comment.posterId] : undefined
      }));

      if (pageNumber === 0) {
        setComments(commentsWithAvatars);
      } else {
        setComments(prev => [...prev, ...commentsWithAvatars]);
      }

      setHasMore(pageNumber < response.totalPages - 1);
      setPage(pageNumber);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadComments(page + 1);
    }
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

  if (loading && comments.length === 0) {
    return (
      <div className="comments-modal">
        <div className="comments-overlay" onClick={onClose}></div>
        <div className="comments-slide-up">
          <div className="comments-header">
            <h3>Comments</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="comments-loading">Loading comments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-modal">
      <div className="comments-overlay" onClick={onClose}></div>
      <div className="comments-slide-up">
        <div className="comments-header">
          <h3>Comments</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="comments-content">
          {error ? (
            <div className="comments-error">{error}</div>
          ) : (
            <>
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {comment.avatar ? (
                        <img src={`data:image/jpeg;base64,${comment.avatar}`} alt={`${comment.posterName} avatar`} />
                      ) : (
                        <span>{comment.posterName?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.posterName}</span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.payload}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <button 
                  onClick={loadMore} 
                  className="view-more-button"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'View more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
