export type BaiduFinancialNotesResult = {
  words_result: Array<{
    result: {
      [key: string]: Array<{ word: string }>;
    };
    type: string;
  }>;
}

interface ConvertedFinancialNotesResult {
  type: string;
  [key: string]: string;
}

export function convertFinancialNotes(baiduResult: BaiduFinancialNotesResult): ConvertedFinancialNotesResult {
  const firstResult = baiduResult.words_result[0];
  if (!firstResult || firstResult.type !== "air_ticket") {
    return { type: "unknown" };
  }

  const converted: ConvertedFinancialNotesResult = {
    type: "air_ticket"
  };

  for (const [key, value] of Object.entries(firstResult.result)) {
    if (Array.isArray(value) && value.length > 0 && 'word' in value[0]) {
      converted[key] = value[0].word;
    }
  }

  return converted;
}