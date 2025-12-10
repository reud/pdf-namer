export const IPC_CHANNELS = {
  GEMINI: {
    PROPOSE_NAME: 'gemini:propose-name',
  },
  FILE: {
    RENAME: 'file:rename',
  },
  SETTINGS: {
    GET_API_KEY: 'settings:get-api-key',
    SAVE_API_KEY: 'settings:save-api-key',
  },
} as const;

export type IpcChannels = typeof IPC_CHANNELS;
