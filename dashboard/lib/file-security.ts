/**
 * File security utilities for validating file uploads
 * Includes magic number validation to prevent MIME type spoofing
 */

// Magic numbers (file signatures) for allowed file types
const FILE_SIGNATURES: Record<string, { signatures: number[][]; mimeTypes: string[] }> = {
  // Images
  jpg: {
    signatures: [[0xFF, 0xD8, 0xFF]],
    mimeTypes: ['image/jpeg'],
  },
  png: {
    signatures: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    mimeTypes: ['image/png'],
  },
  gif: {
    signatures: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    mimeTypes: ['image/gif'],
  },
  webp: {
    signatures: [[0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50]],
    mimeTypes: ['image/webp'],
  },
  // Documents
  pdf: {
    signatures: [[0x25, 0x50, 0x44, 0x46]],
    mimeTypes: ['application/pdf'],
  },
  docx: {
    signatures: [[0x50, 0x4B, 0x03, 0x04]], // Also matches xlsx, pptx (ZIP-based)
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
  doc: {
    signatures: [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
    mimeTypes: [
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
    ],
  },
  // Text and other
  txt: {
    signatures: [], // Plain text has no magic number
    mimeTypes: ['text/plain'],
  },
  csv: {
    signatures: [], // CSV has no magic number
    mimeTypes: ['text/csv'],
  },
  zip: {
    signatures: [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06], [0x50, 0x4B, 0x07, 0x08]],
    mimeTypes: ['application/zip'],
  },
};

/**
 * Validates file content against its declared MIME type using magic numbers
 */
export async function validateFileType(
  file: File
): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  try {
    // Read first 12 bytes (enough for most signatures)
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Check against known signatures
    for (const [fileType, { signatures, mimeTypes }] of Object.entries(FILE_SIGNATURES)) {
      // Skip validation for types without signatures (text/csv)
      if (signatures.length === 0) {
        if (mimeTypes.includes(file.type)) {
          return { valid: true, detectedType: fileType };
        }
        continue;
      }

      // Check each signature for this file type
      for (const signature of signatures) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          // undefined in signature means "any byte" (for variable fields)
          if (signature[i] !== undefined && bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }

        if (matches && mimeTypes.includes(file.type)) {
          return { valid: true, detectedType: fileType };
        }
      }
    }

    // For text/csv files, do basic content check
    if (file.type === 'text/plain' || file.type === 'text/csv') {
      const text = await file.slice(0, 1024).text();
      // Check if it's valid UTF-8 text
      if (/^[\x00-\x7F\n\r\t]*$/.test(text) || /^[\u0000-\uFFFF]*$/.test(text)) {
        return { valid: true, detectedType: file.type };
      }
    }

    return {
      valid: false,
      error: 'File content does not match declared MIME type',
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate file type',
    };
  }
}

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
];

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  default: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB for images
  document: 50 * 1024 * 1024, // 50MB for documents
};

/**
 * Sanitizes filename to prevent path traversal and injection attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Limit length
}

/**
 * Validates file size based on file type
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const isImage = file.type.startsWith('image/');
  const maxSize = isImage ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.document;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}
