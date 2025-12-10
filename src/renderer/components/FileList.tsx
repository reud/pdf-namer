import React from 'react';
import { FileItemCard, FileItemProps } from './FileItemCard';

export interface FileData extends Omit<FileItemProps, 'onApprove' | 'onReject' | 'onRetry'> {}

interface FileListProps {
  files: FileData[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string) => void;
  onRetry: (id: string) => void;
}

export function FileList({ files, onApprove, onReject, onRetry }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
        Files ({files.length})
      </h3>
      <div className="space-y-3">
        {files.map((file) => (
          <FileItemCard
            key={file.id}
            {...file}
            onApprove={onApprove}
            onReject={onReject}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}
