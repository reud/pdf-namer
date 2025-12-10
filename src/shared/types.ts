export type FileStatus = 'analyzing' | 'review' | 'completed' | 'error';

export interface ProcessingFile {
  id: string;
  originalName: string;
  path: string; // Full path needed for backend processing
  status: FileStatus;
  proposedName?: string;
  errorMessage?: string;
}

// Request/Response types for IPC
export interface ProposeNameRequest {
  filePath: string;
  originalName: string;
}

export interface ProposeNameResponse {
  success: boolean;
  proposedName?: string;
  error?: string;
}

export interface RenameFileRequest {
  filePath: string;
  newFileName: string;
}

export interface RenameFileResponse {
  success: boolean;
  newPath?: string;
  error?: string;
}

export interface ApiKeyResponse {
  success: boolean;
  key?: string;
  error?: string;
}
