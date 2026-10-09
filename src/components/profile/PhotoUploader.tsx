import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { uploadMemberPhoto } from '../../lib/storage';
import { useToast } from '../ui/Toast';

interface PhotoUploaderProps {
  memberId: string;
  memberName: string;
  photoPath: string | null;
  onPhotoUploaded: (newPath: string, newUrl: string) => void;
}

export function PhotoUploader({
  memberId,
  memberName,
  photoPath,
  onPhotoUploaded,
}: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsUploading(true);
      const result = await uploadMemberPhoto(memberId, file);
      onPhotoUploaded(result.photo_path, result.signed_url);
      toast.success('Photo uploaded successfully');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      toast.error(err.message || 'Failed to upload photo');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      <div className="relative">
        <Avatar
          name={memberName}
          photoPath={photoPath}
          photoUrl={previewUrl}
          size="xl"
          className="ring-4 ring-slate-800"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Upload photo"
        >
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <span className="mt-2 text-[11px] text-slate-400">
        Click camera icon to change photo
      </span>
    </div>
  );
}
