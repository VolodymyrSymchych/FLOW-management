'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import axios from 'axios';

interface FileAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key?: string;
}

interface FilePreviewProps {
  file: FileAttachment;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreviewUrl();
  }, [file.id]);

  const loadPreviewUrl = async () => {
    try {
      const response = await axios.get(`/api/files/${file.id}/download`);
      setDownloadUrl(response.data.downloadUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const isImage = file.fileType.startsWith('image/');
  const isPDF = file.fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 glass-strong rounded-xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-text-primary truncate flex-1">
            {file.fileName}
          </h3>
          <div className="flex items-center space-x-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={file.fileName}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5 text-text-secondary" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={file.fileName}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {!loading && !error && downloadUrl && (
            <>
              {isImage && (
                <div className="flex items-center justify-center">
                  <img
                    src={downloadUrl}
                    alt={file.fileName}
                    className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded-lg"
                  />
                </div>
              )}

              {isPDF && (
                <div className="w-full h-[calc(90vh-120px)]">
                  <iframe
                    src={downloadUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title={file.fileName}
                  />
                </div>
              )}

              {!isImage && !isPDF && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <p className="text-text-secondary mb-4">
                      Preview not available for this file type
                    </p>
                    <a
                      href={downloadUrl}
                      download={file.fileName}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

