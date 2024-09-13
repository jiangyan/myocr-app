interface BaiduOCRResult {
  words_result: Array<{
    result: {
      [key: string]: Array<{ word: string }>;
    };
    type: string;
  }>;
}

interface ConvertedOCRResult {
  type: string;
  [key: string]: string;
}

export function convertOCRResult(baiduResult: BaiduOCRResult): ConvertedOCRResult {
  const firstResult = baiduResult.words_result[0];
  if (!firstResult) {
    return { type: "unknown" };
  }

  const converted: ConvertedOCRResult = {
    type: firstResult.type
  };

  for (const [key, value] of Object.entries(firstResult.result)) {
    if (Array.isArray(value) && value.length > 0 && 'word' in value[0]) {
      converted[key] = value[0].word;
    }
  }

  return converted;
}