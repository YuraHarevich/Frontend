import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { iconService } from '../services/iconService';
import type { Comment, CommentsResponse } from '../types/comment';

interface InlineCommentsProps {
  postId: string;
  isVisible: boolean;
  refreshKey?: number;
}

export function InlineComments({ postId, isVisible, refreshKey }: InlineCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isVisible && comments.length === 0) {
      loadComments();
    }
  }, [isVisible, postId]);

  // Обновляем комментарии при изменении refreshKey
  useEffect(() => {
    if (refreshKey && isVisible) {
      setComments([]);
      setPage(0);
      setHasMore(true);
      loadComments();
    }
  }, [refreshKey, isVisible]);

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

  if (!isVisible) {
    return null;
  }

  if (loading) {
    return (
      <div className="inline-comments">
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-comments">
        <div className="comments-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="inline-comments">
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
                <span className="comment-time">{formatDate(comment.leavedAt)}</span>
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
    </div>
  );
}
