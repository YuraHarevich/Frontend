// components/AvatarUploadModal.tsx
import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { iconService } from '../services/iconService';
import type { User } from '../types/auth';
import '../../styles/avatar-upload-modal.css';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUploaded: () => void;
  currentUser: User;
}

export function AvatarUploadModal({ isOpen, onClose, onAvatarUploaded, currentUser }: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Проверяем размер файла (например, максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await iconService.uploadAvatar(currentUser.id, selectedFile);
      
      // Сброс формы
      setSelectedFile(null);
      setPreview(null);
      
      onAvatarUploaded();
      onClose();
    } catch (err) {
      setError('Error uploading avatar');
      console.error('Error uploading avatar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      onClose();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Avatar</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <Icon name="cross" width={24} height={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="upload-section">
            {!selectedFile ? (
              <div className="upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                  <Icon name="camera" width={48} height={48} />
                  <span>Click to upload avatar</span>
                  <small>PNG, JPG, GIF up to 5MB</small>
                </button>
              </div>
            ) : (
              <div className="preview-section">
                <div className="preview-container">
                  <img 
                    src={preview!} 
                    alt="Avatar preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="remove-button"
                    disabled={isLoading}
                  >
                    <Icon name="cross" width={24} height={24} />
                  </button>
                </div>
                <p className="file-info">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

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
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
