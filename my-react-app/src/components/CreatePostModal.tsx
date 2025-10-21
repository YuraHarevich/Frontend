// components/CreatePostModal.tsx
import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { postService } from '../services/postService';
import type { User } from '../types/auth';
import '../../styles/create-post-modal.css';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  currentUser: User;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated, currentUser }: CreatePostModalProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = [...files, ...selectedFiles];
    
    // Ограничиваем количество файлов (например, максимум 10)
    if (newFiles.length > 10) {
      setError('Maximum 10 files');
      return;
    }

    setFiles(newFiles);
    
    // Создаем превью для изображений
    const newPreviews: string[] = [];
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setPreviews([...previews, ...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() && files.length === 0) {
      setError('Add text or files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await postService.createPost(
        text.trim(),
        currentUser.username,
        currentUser.id,
        files
      );
      
      // Сброс формы
      setText('');
      setFiles([]);
      setPreviews([]);
      
      onPostCreated();
      onClose();
    } catch (err) {
      setError('Error creating post');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setText('');
      setFiles([]);
      setPreviews([]);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Post</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <Icon name="cross" width={20} height={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's new?"
              className="post-textarea"
              rows={4}
              maxLength={2000}
            />
            <div className="char-count">
              {text.length}/2000
            </div>
          </div>

          <div className="file-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="file-input"
              disabled={isLoading}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
              disabled={isLoading}
            >
              <Icon name="camera" width={20} height={20} />
              <span>Add photos/videos</span>
            </button>
          </div>

          {files.length > 0 && (
            <div className="file-previews">
              <h3>Selected files ({files.length})</h3>
              <div className="preview-grid">
                {files.map((file, index) => (
                  <div key={index} className="file-preview">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={previews[index]} 
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-video">
                        <Icon name="video" width={24} height={24} />
                        <span>{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-button"
                      disabled={isLoading}
                    >
                      <Icon name="cross" width={16} height={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || (!text.trim() && files.length === 0)}
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
