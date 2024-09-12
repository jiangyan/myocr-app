import { convertFinancialNotes } from './baidu/financialNotesConverter';

export function convertOCRResult(result: any, provider: string, apiType: string) {
  if (provider === 'BAIDU') {
    if (apiType === 'Financial Notes') {
      return convertFinancialNotes(result);
    }
  }
  return { type: 'unknown' };
}