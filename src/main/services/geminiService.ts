import { getApiKey } from './storeService';
import { ProposeNameResponse } from '../../shared/types';

export const proposeFileName = async (filePath: string, originalName: string): Promise<ProposeNameResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: 'API Key not configured' };
  }

  // STUB: Simulate processing delay and return a dummy name
  console.log(`[GeminiStub] Analyzing file: ${filePath}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
        // Simple logic for stub: prefix with date
      const datePrefix = new Date().toISOString().split('T')[0];
      resolve({
        success: true,
        proposedName: `${datePrefix}_${originalName}`,
      });
    }, 1500);
  });
};
