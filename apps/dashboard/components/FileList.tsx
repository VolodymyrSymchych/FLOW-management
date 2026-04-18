'use client';

import { useState, useEffect } from 'react';
import { File as FileIcon, Download, Trash2, Image, FileText, Eye } from 'lucide-react';
import axios from 'axios';
import { FilePreview } from './FilePreview';

interface FileAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key?: string;
  createdAt: string;
  version: number;
  uploadedBy: number;
}

interface FileListProps {
  projectId?: number;
  taskId?: number;
  onDelete?: () => void;
}

export function FileList({ projectId, taskId, onDelete }: FileListProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);

  useEffect(() => {
    loadFiles();
  }, [projectId, taskId]);

  const loadFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId.toString());
      if (taskId) params.append('taskId', taskId.toString());

      const response = await axios.get(`/api/files?${params.toString()}`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await axios.delete(`/api/files/${fileId}`);
      loadFiles();
      onDelete?.();
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      alert(error.response?.data?.error || 'Failed to delete file');
    }
  };

  const handleDownload = async (file: FileAttachment) => {
    try {
      const response = await axios.get(`/api/files/${file.id}/download`);
      window.open(response.data.downloadUrl, '_blank');
    } catch (error: any) {
      console.error('Failed to download file:', error);
      alert(error.response?.data?.error || 'Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <FileIcon className="w-5 h-5 text-text-tertiary" />;
  };

  const canPreview = (fileType: string) => {
    return fileType.startsWith('image/') || fileType === 'application/pdf';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="glass-medium rounded-lg p-4 border border-white/10 hover:glass-light transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {file.fileName}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatFileSize(file.fileSize)} • v{file.version} • {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canPreview(file.fileType) && (
                <button
                  onClick={() => setPreviewFile(file)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4 text-text-secondary" />
                </button>
              )}
              <button
                onClick={() => handleDownload(file)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-text-secondary" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}

