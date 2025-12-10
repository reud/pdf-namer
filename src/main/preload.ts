// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import { ProposeNameRequest, RenameFileRequest, ProposeNameResponse, RenameFileResponse, ApiKeyResponse } from '../shared/types';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  settings: {
    getApiKey: (): Promise<ApiKeyResponse> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.GET_API_KEY),
    saveApiKey: (key: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.SAVE_API_KEY, key),
  },
  gemini: {
    proposeName: (request: ProposeNameRequest): Promise<ProposeNameResponse> =>
      ipcRenderer.invoke(IPC_CHANNELS.GEMINI.PROPOSE_NAME, request),
  },
  file: {
    rename: (request: RenameFileRequest): Promise<RenameFileResponse> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE.RENAME, request),
    getPath: (file: File): string => webUtils.getPathForFile(file),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;