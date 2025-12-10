import fs from 'fs/promises';
import path from 'path';

export const renameFile = async (filePath: string, newFileName: string): Promise<string> => {
  try {
    const dir = path.dirname(filePath);
    // Ensure newFileName is just the name, not a path
    const safeNewFileName = path.basename(newFileName); 
    const newPath = path.join(dir, safeNewFileName);

    if (filePath === newPath) {
        return newPath;
    }

    await fs.rename(filePath, newPath);
    return newPath;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};
