import Modal from '../modal';
import { useState } from 'react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const MAX_FILE_SIZE = 512 * 1024; // 512KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function AvatarUploadModal({ isOpen, onClose, onUpload }: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 512KB';
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only JPG, JPEG and PNG files are allowed';
    }
    return '';
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setError(error);
      setSelectedFile(null);
    } else {
      setError('');
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      onClose();
    } catch (err) {
      setError('Failed to upload avatar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Avatar">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-foreground/50 bg-foreground/5' : 'border-foreground/20'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer text-foreground/70 hover:text-foreground"
          >
            <div className="space-y-2">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p>Drag and drop an image here, or click to select</p>
              <p className="text-sm text-foreground/50">
                JPG, JPEG or PNG, max 512KB
              </p>
            </div>
          </label>
          {selectedFile && (
            <p className="mt-2 text-sm text-foreground/70">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </form>
    </Modal>
  );
}