import { getApiKey } from './storeService';
import { ProposeNameResponse } from '../../shared/types';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

export const proposeFileName = async (filePath: string, originalName: string): Promise<ProposeNameResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: 'API Key not configured' };
  }

  let tempPdfPath: string | undefined;
  let uploadResult: any | undefined; // Type as any to avoid complex type imports for now, or use specific type if available

  // Initialize Gemini clients
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  try {
    // 1. Load the original PDF document
    const existingPdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Create a new PDF document for the first page
    const newPdfDoc = await PDFDocument.create();

    // 3. Copy the first page from the original document
    if (pdfDoc.getPageCount() > 0) {
      const [firstPage] = await newPdfDoc.copyPages(pdfDoc, [0]); // Copy the first page (index 0)
      newPdfDoc.addPage(firstPage);
    } else {
      console.warn(`[GeminiService] PDF file is empty: ${filePath}`);
      return { success: false, error: 'PDF file is empty or corrupted.' };
    }

    // 4. Save the new single-page PDF to a temporary file
    const pdfBytes = await newPdfDoc.save();
    tempPdfPath = path.join(os.tmpdir(), `temp_page1_${Date.now()}.pdf`);
    await fs.writeFile(tempPdfPath, pdfBytes);
    console.log(`[GeminiService] Extracted first page to: ${tempPdfPath}`);

    // 5. Upload the file to Gemini API
    console.log(`[GeminiService] Uploading to Gemini...`);
    uploadResult = await fileManager.uploadFile(tempPdfPath, {
      mimeType: "application/pdf",
      displayName: `Page 1 of ${originalName}`,
    });
    console.log(`[GeminiService] Uploaded file: ${uploadResult.file.name}`);

    // 6. Generate content using the uploaded file
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      {
        text: `Analyze the attached PDF page. Suggest a concise, descriptive filename for this document based on its content (e.g., date, type of document, company name).

      Requirements:
      - Return ONLY the filename.
      - Do NOT include the file extension (like .pdf).
      - Use underscores (_) or hyphens (-) instead of spaces.
      - Keep it under 50 characters if possible.
      - If a date is found, put it at the beginning in YYYY-MM-DD format.`,
      },
    ]);

    const proposedName = result.response.text().trim();
    console.log(`[GeminiService] Proposed name: ${proposedName}`);

    // Basic validation/sanitization of the returned name
    const sanitizedProposedName = proposedName.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '_');

    // Add .pdf extension if not present (though prompt asked not to, safety first)
    const finalName = sanitizedProposedName.toLowerCase().endsWith('.pdf')
      ? sanitizedProposedName
      : `${sanitizedProposedName}.pdf`;

    return {
      success: true,
      proposedName: finalName,
    };

  } catch (error) {
    console.error(`[GeminiService] Error processing PDF ${filePath}:`, error);
    return { success: false, error: `Failed to process PDF: ${(error as Error).message}` };
  } finally {
    // 7. Clean up (Local temp file)
    if (tempPdfPath) {
      setTimeout(async () => {
        try {
          await fs.unlink(tempPdfPath as string);
          console.log(`[GeminiService] Cleaned up local temp file: ${tempPdfPath}`);
        } catch (cleanupError) {
          console.error(`[GeminiService] Error cleaning up local temp file:`, cleanupError);
        }
      }, 1000);
    }

    // 8. Clean up (Gemini cloud file)
    if (uploadResult && uploadResult.file && uploadResult.file.name) {
       // Fire and forget cleanup to return response faster
       fileManager.deleteFile(uploadResult.file.name).then(() => {
           console.log(`[GeminiService] Cleaned up Gemini cloud file: ${uploadResult.file.name}`);
       }).catch(err => {
           console.error(`[GeminiService] Failed to delete Gemini cloud file:`, err);
       });
    }
  }
};
