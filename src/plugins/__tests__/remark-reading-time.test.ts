import { describe, it, expect } from 'vitest';
import { remarkReadingTime } from '../remark-reading-time';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import type { ReadingTimeData } from '../../types/reading-time';

// 模擬 Astro 的 data 結構
function createAstroData() {
  return {
    astro: {
      frontmatter: {} as {
        readingTime?: ReadingTimeData;
        minutesRead?: string;
        [key: string]: any;
      },
    },
  };
}

// 建立測試處理器
function createProcessor(options = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkReadingTime, options)
    .use(remarkStringify);
}

describe('remarkReadingTime', () => {
  it('should calculate reading time for simple text', async () => {
    const processor = createProcessor();
    const markdown = '這是一個測試文章。'.repeat(100);
    const data = createAstroData();

    await processor.process({ value: markdown, data });

    expect(data.astro.frontmatter.readingTime).toBeDefined();
    expect(data.astro.frontmatter.readingTime?.minutes).toBeGreaterThan(0);
    expect(data.astro.frontmatter.readingTime?.words).toBeGreaterThan(0);
    expect(data.astro.frontmatter.readingTime?.text).toContain('min read');
    expect(data.astro.frontmatter.minutesRead).toBe(
      data.astro.frontmatter.readingTime?.text
    );
  });

  it('should handle empty content', async () => {
    const processor = createProcessor();
    const markdown = '';
    const data = createAstroData();

    await processor.process({ value: markdown, data });

    // 空內容不應該設置 readingTime
    expect(data.astro.frontmatter.readingTime).toBeUndefined();
  });

  it('should calculate reading time for mixed Chinese-English content', async () => {
    const processor = createProcessor();
    const chineseText =
      '這是中文內容，用於測試中英混合文字的閱讀時間計算功能。';
    const englishText =
      'This is English content for testing mixed language reading time calculation.';
    const mixedContent = (chineseText + englishText).repeat(20);
    const data = createAstroData();

    await processor.process({ value: mixedContent, data });

    const readingTime = data.astro.frontmatter.readingTime;
    expect(readingTime).toBeDefined();
    expect(readingTime?.minutes).toBeGreaterThan(0);
    expect(readingTime?.words).toBeGreaterThan(50);
    expect(readingTime?.text).toContain('min read');
  });

  it('should add time for code blocks', async () => {
    const processor = createProcessor();
    const markdownWithCode = `# 測試文章

這是一般文字內容。

\`\`\`typescript
function calculateReadingTime() {
  return "這是一個很長的程式碼區塊，應該會增加閱讀時間";
}

const complexFunction = (param1, param2) => {
  return param1.map(item => item.process(param2));
};
\`\`\`

更多文字內容。`;

    const data = createAstroData();
    await processor.process({ value: markdownWithCode, data });

    const readingTime = data.astro.frontmatter.readingTime;
    expect(readingTime).toBeDefined();
    expect(readingTime?.minutes).toBeGreaterThan(0);
    expect(readingTime?.text).toContain('min read');
  });

  it('should add time for images', async () => {
    const processor = createProcessor();
    const markdownWithImages = `# 測試文章

這是一般文字內容。

![測試圖片](test1.jpg)
![另一張圖片](test2.jpg)

更多文字內容。`;

    const data = createAstroData();
    await processor.process({ value: markdownWithImages, data });

    const readingTime = data.astro.frontmatter.readingTime;
    expect(readingTime).toBeDefined();
    expect(readingTime?.minutes).toBeGreaterThan(0);

    // 兩張圖片應該增加閱讀時間 (2 * 12秒 = 24秒)
    expect(readingTime?.time).toBeGreaterThan(24000);
  });

  it('should use Medium-style format', async () => {
    const processor = createProcessor();
    const markdown = 'This is a test article. '.repeat(200); // 較長的文章
    const data = createAstroData();

    await processor.process({ value: markdown, data });

    const text = data.astro.frontmatter.readingTime?.text;
    expect(text).toMatch(/^\d+ min read$/);
  });

  it('should handle custom words per minute', async () => {
    const fastProcessor = createProcessor({ wordsPerMinute: 300 });
    const slowProcessor = createProcessor({ wordsPerMinute: 100 });

    const markdown = '測試文字內容。'.repeat(100);

    const fastData = createAstroData();
    const slowData = createAstroData();

    await fastProcessor.process({ value: markdown, data: fastData });
    await slowProcessor.process({ value: markdown, data: slowData });

    expect(fastData.astro.frontmatter.readingTime?.minutes).toBeLessThan(
      slowData.astro.frontmatter.readingTime!.minutes
    );
  });

  it('should format time correctly for different durations', async () => {
    const processor = createProcessor();

    // 測試短文章 (< 1分鐘)
    const shortData = createAstroData();
    await processor.process({ value: 'Short text.', data: shortData });
    expect(shortData.astro.frontmatter.readingTime?.text).toBe('< 1 min read');

    // 測試長文章
    const longData = createAstroData();
    const longText =
      '這是一個很長的測試文章，用來測試閱讀時間的格式化功能。'.repeat(100);
    await processor.process({ value: longText, data: longData });
    expect(longData.astro.frontmatter.readingTime?.text).toMatch(
      /\d+ min read/
    );
  });

  it('should handle mixed content optimization', async () => {
    const enabledProcessor = createProcessor({ enableMixedContent: true });
    const disabledProcessor = createProcessor({ enableMixedContent: false });

    const mixedContent =
      '這是中文內容 mixed with English content 用於測試優化功能。'.repeat(50);

    const enabledData = createAstroData();
    const disabledData = createAstroData();

    await enabledProcessor.process({ value: mixedContent, data: enabledData });
    await disabledProcessor.process({
      value: mixedContent,
      data: disabledData,
    });

    // 兩者都應該計算出合理的時間
    expect(enabledData.astro.frontmatter.readingTime?.minutes).toBeGreaterThan(
      0
    );
    expect(disabledData.astro.frontmatter.readingTime?.minutes).toBeGreaterThan(
      0
    );
  });
});
