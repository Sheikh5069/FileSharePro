/**
 * File utility functions for FileShare Pro
 * Provides common file operations and validations
 */

// File size constants
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  WARNING_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on MIME type
 */
export function getFileIcon(mimeType: string): string {
  if (SUPPORTED_FILE_TYPES.IMAGES.includes(mimeType)) return '🖼️';
  if (SUPPORTED_FILE_TYPES.DOCUMENTS.includes(mimeType)) return '📄';
  if (SUPPORTED_FILE_TYPES.ARCHIVES.includes(mimeType)) return '📦';
  if (SUPPORTED_FILE_TYPES.VIDEOS.includes(mimeType)) return '🎥';
  if (SUPPORTED_FILE_TYPES.AUDIO.includes(mimeType)) return '🎵';
  return '📁';
}

/**
 * Get file category based on MIME type
 */
export function getFileCategory(mimeType: string): string {
  if (SUPPORTED_FILE_TYPES.IMAGES.includes(mimeType)) return 'Image';
  if (SUPPORTED_FILE_TYPES.DOCUMENTS.includes(mimeType)) return 'Document';
  if (SUPPORTED_FILE_TYPES.ARCHIVES.includes(mimeType)) return 'Archive';
  if (SUPPORTED_FILE_TYPES.VIDEOS.includes(mimeType)) return 'Video';
  if (SUPPORTED_FILE_TYPES.AUDIO.includes(mimeType)) return 'Audio';
  return 'Other';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_SIZE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(FILE_SIZE_LIMITS.MAX_SIZE)} limit`
    };
  }

  // Check if file type is supported
  const allSupportedTypes = Object.values(SUPPORTED_FILE_TYPES).flat();
  if (!allSupportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`
    };
  }

  return { isValid: true };
}

/**
 * Check if file is previewable
 */
export function isPreviewable(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.IMAGES.includes(mimeType) || 
         mimeType === 'application/pdf' ||
         mimeType === 'text/plain';
}

/**
 * Generate a safe filename for storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Generate a unique filename to prevent conflicts
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const sanitizedName = sanitizeFilename(nameWithoutExt);
  
  return `${sanitizedName}_${timestamp}.${extension}`;
}

/**
 * Convert bytes to different units
 */
export const convertBytes = {
  toKB: (bytes: number) => bytes / 1024,
  toMB: (bytes: number) => bytes / (1024 * 1024),
  toGB: (bytes: number) => bytes / (1024 * 1024 * 1024),
};

/**
 * File upload progress calculator
 */
export function calculateUploadProgress(loaded: number, total: number): number {
  return Math.round((loaded / total) * 100);
}

/**
 * Estimate upload time remaining
 */
export function estimateUploadTime(loaded: number, total: number, startTime: number): string {
  const elapsed = Date.now() - startTime;
  const rate = loaded / elapsed; // bytes per ms
  const remaining = total - loaded;
  const timeLeft = remaining / rate; // ms
  
  if (timeLeft < 1000) return 'Less than 1 second';
  if (timeLeft < 60000) return `${Math.round(timeLeft / 1000)} seconds`;
  return `${Math.round(timeLeft / 60000)} minutes`;
}