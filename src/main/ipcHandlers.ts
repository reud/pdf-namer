import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import { getApiKey, saveApiKey } from './services/storeService';
import { proposeFileName } from './services/geminiService';
import { renameFile } from './services/fileService';
import { ProposeNameRequest, RenameFileRequest } from '../shared/types';

export const registerIpcHandlers = () => {
  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS.GET_API_KEY, async () => {
    try {
      const key = getApiKey();
      return { success: true, key };
    } catch (error) {
        console.error('Failed to get API key:', error);
        return { success: false, error: 'Failed to retrieve API key' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS.SAVE_API_KEY, async (_, key: string) => {
    try {
      saveApiKey(key);
      return { success: true };
    } catch (error) {
      console.error('Failed to save API key:', error);
      return { success: false, error: 'Failed to save API key' };
    }
  });

  // Gemini Service
  ipcMain.handle(IPC_CHANNELS.GEMINI.PROPOSE_NAME, async (_, request: ProposeNameRequest) => {
    try {
      return await proposeFileName(request.filePath, request.originalName);
    } catch (error) {
       return { success: false, error: (error as Error).message };
    }
  });

  // File Service
  ipcMain.handle(IPC_CHANNELS.FILE.RENAME, async (_, request: RenameFileRequest) => {
    try {
      const newPath = await renameFile(request.filePath, request.newFileName);
      return { success: true, newPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
};
