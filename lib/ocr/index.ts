import { convertFinancialNotes, BaiduFinancialNotesResult } from './baidu/financialNotesConverter';

// Define a more specific type for the result parameter
type OCRResult = {
  // Add appropriate properties based on the actual structure of your OCR result
  // For example:
  text?: string;
  confidence?: number;
  // ... other properties
};

export function convertOCRResult(result: OCRResult, provider: string, apiType: string) {
  if (provider === 'BAIDU') {
    if (apiType === 'Financial Notes') {
      return convertFinancialNotes(result as BaiduFinancialNotesResult);
    }
  }
  return { type: 'unknown' };
}