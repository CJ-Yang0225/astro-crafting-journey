import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { ReadingTimeData } from '@/types/reading-time';
import type { Node } from 'unist';

interface ReadingTimePluginOptions {
  /** 閱讀速度 (字/分鐘) */
  wordsPerMinute?: number;
  /** 語言區域設定 */
  locale?: 'zh-TW' | 'en';
  /** 程式碼區塊閱讀速度係數 (相對於一般文字) */
  codeMultiplier?: number;
  /** 每張圖片增加的閱讀秒數 */
  imageSeconds?: number;
  /** 是否啟用中英文混合優化 */
  enableMixedContent?: boolean;
}

const DEFAULT_OPTIONS: Required<ReadingTimePluginOptions> = {
  wordsPerMinute: 200,
  locale: 'zh-TW',
  codeMultiplier: 0.5, // 程式碼閱讀速度較慢
  imageSeconds: 12,
  enableMixedContent: true,
};

/**
 * 計算額外內容（程式碼區塊、圖片）的時間
 */
function calculateExtraTime(tree: Node, options: Required<ReadingTimePluginOptions>): number {
  let extraSeconds = 0;
  let codeCharCount = 0;

  visit(tree, (node: any) => {
    switch (node.type) {
      case 'code':
        // 程式碼區塊按字符數計算，速度較慢
        if (node.value && typeof node.value === 'string') {
          codeCharCount += node.value.length;
        }
        break;
      
      case 'image':
        // 每張圖片增加固定秒數
        extraSeconds += options.imageSeconds;
        break;
    }
  });

  // 程式碼閱讀時間 = 字符數 / 5 (估算為單詞) * 係數 / 閱讀速度
  const codeWords = codeCharCount / 5;
  const codeSeconds = (codeWords * options.codeMultiplier * 60) / options.wordsPerMinute;

  return extraSeconds + codeSeconds;
}

/**
 * 中英文混合內容優化
 * 基於中文字符比例微調閱讀速度
 */
function optimizeForMixedContent(text: string, baseWpm: number): number {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = text.replace(/\s+/g, '').length;
  
  if (totalChars === 0) return baseWpm;
  
  const chineseRatio = chineseChars / totalChars;
  
  // 中文內容比例高時，稍微提升閱讀速度（中文資訊密度較高）
  // 但調整幅度不宜過大，避免不準確
  const adjustment = chineseRatio > 0.3 ? 1.05 : 1.0;
  
  return baseWpm * adjustment;
}

/**
 * 格式化閱讀時間顯示 (Medium 風格)
 * 統一使用國際格式，避免中英文混排問題
 */
function formatReadingTime(minutes: number): string {
  const roundedMinutes = Math.ceil(minutes);
  
  // 統一使用 Medium 風格格式
  if (minutes < 1) {
    return '< 1 min read';
  } else if (roundedMinutes >= 60) {
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m read` : `${hours}h read`;
  } else {
    return `${roundedMinutes} min read`;
  }
}

/**
 * Remark plugin 計算閱讀時間並注入到 frontmatter
 * 遵循 Astro 官方文檔模式
 */
export function remarkReadingTime(userOptions: ReadingTimePluginOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  
  return function (tree: Node, { data }: { data: any }) {
    // 提取純文字內容
    const textContent = toString(tree);
    
    if (!textContent?.trim()) {
      return; // 空內容直接跳過
    }

    try {
      // 計算基礎閱讀時間
      const adjustedWpm = options.enableMixedContent 
        ? optimizeForMixedContent(textContent, options.wordsPerMinute)
        : options.wordsPerMinute;

      const baseResult = getReadingTime(textContent, {
        wordsPerMinute: adjustedWpm,
      });

      // 計算額外內容時間
      const extraSeconds = calculateExtraTime(tree, options);
      
      // 合併總時間
      const totalTimeMs = baseResult.time + (extraSeconds * 1000);
      const totalMinutes = totalTimeMs / (1000 * 60);

      // 建立結果資料
      const readingTimeData: ReadingTimeData = {
        text: formatReadingTime(totalMinutes),
        minutes: Math.ceil(totalMinutes),
        time: totalTimeMs,
        words: baseResult.words,
      };

      // 注入到 frontmatter (遵循 Astro 官方模式)
      data.astro.frontmatter.readingTime = readingTimeData;
      data.astro.frontmatter.minutesRead = readingTimeData.text;

    } catch (error) {
      // 靜默失敗，不中斷建置
      console.warn('[remarkReadingTime] 計算失敗:', error);
    }
  };
}