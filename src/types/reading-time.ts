/**
 * Reading Time Calculator Type Definitions
 * 
 * Provides type-safe interfaces for reading time calculation system
 * that integrates with Astro Content Collections and MDX processing.
 */

/**
 * Reading time calculation result data structure
 */
export interface ReadingTimeData {
  /** Human-readable text like "5 min read" */
  text: string;
  /** Precise reading time in minutes (e.g., 5.2) */
  minutes: number;
  /** Reading time in milliseconds */
  time: number;
  /** Total word count */
  words: number;
}

/**
 * Configuration options for reading time calculation
 */
export interface ReadingTimeOptions {
  /** Words per minute for regular text content (default: 200) */
  wordsPerMinute?: number;
  /** Words per minute for code blocks (default: 100) */
  codeWordsPerMinute?: number;
  /** Additional time per image in seconds (default: 12) */
  imageReadingTime?: number;
  /** Words per minute for table content (default: 150) */
  tableWordsPerMinute?: number;
  /** Display format preference */
  format?: 'short' | 'long';
  /** Locale for text formatting (future use) */
  locale?: string;
}

/**
 * Content analysis result for different content types
 */
export interface ContentAnalysis {
  /** Word count in regular text content */
  textWords: number;
  /** Word count in code blocks */
  codeWords: number;
  /** Number of images */
  imageCount: number;
  /** Word count in tables */
  tableWords: number;
  /** List complexity multiplier factor */
  listComplexity: number;
  /** Total processed nodes count */
  totalNodes?: number;
}

/**
 * Extended reading time data with future extensibility
 * Reserved for future features like reading progress bar
 */
export interface ReadingTimeExtended extends ReadingTimeData {
  /** Article sections for progress tracking */
  sections?: ReadingSection[];
  /** Progress checkpoints in word positions */
  checkpoints?: number[];
  /** Estimated difficulty level (1-5) */
  difficulty?: number;
}

/**
 * Reading section data for progress tracking
 */
export interface ReadingSection {
  /** Section title or heading */
  title: string;
  /** Starting word position */
  startWords: number;
  /** Ending word position */
  endWords: number;
  /** Estimated reading time for this section */
  estimatedMinutes: number;
  /** Section depth level */
  level?: number;
}

/**
 * Remark plugin processing context data
 */
export interface RemarkProcessingContext {
  /** File path being processed */
  filePath?: string;
  /** Processing start time */
  startTime: number;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Cache key for memoization */
  cacheKey?: string;
}

/**
 * Reading time calculation error types
 */
export type ReadingTimeError = 
  | 'INVALID_CONTENT'
  | 'PROCESSING_FAILED'
  | 'CONFIGURATION_ERROR'
  | 'AST_PARSING_ERROR';

/**
 * Error result for graceful degradation
 */
export interface ReadingTimeErrorResult {
  /** Error type identifier */
  error: ReadingTimeError;
  /** Error message for debugging */
  message: string;
  /** Fallback reading time data if available */
  fallback?: Partial<ReadingTimeData>;
}

/**
 * Type guard to check if reading time data is valid
 */
export function isValidReadingTimeData(data: any): data is ReadingTimeData {
  return (
    data &&
    typeof data.text === 'string' &&
    typeof data.minutes === 'number' &&
    typeof data.time === 'number' &&
    typeof data.words === 'number' &&
    data.minutes >= 0 &&
    data.time >= 0 &&
    data.words >= 0
  );
}

/**
 * Default reading time options
 */
export const DEFAULT_READING_TIME_OPTIONS: Required<Omit<ReadingTimeOptions, 'locale'>> = {
  wordsPerMinute: 200,
  codeWordsPerMinute: 100,
  imageReadingTime: 12,
  tableWordsPerMinute: 150,
  format: 'long'
} as const;