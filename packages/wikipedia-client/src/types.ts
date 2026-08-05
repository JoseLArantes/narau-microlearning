export interface CategoryMember {
  pageId: number;
  title: string;
}

export interface PageDetails {
  pageId: number;
  title: string;
  namespace: number;
  extract: string;
  thumbnailUrl?: string;
  pageImage?: string;
  categories: string[];
  lastRevisionId?: string;
}

export interface PageSummary {
  title: string;
  description?: string;
  extract?: string;
  thumbnailUrl?: string;
  originalImageUrl?: string;
  pageUrl?: string;
}

export interface CategoryOptions {
  /** Maximum number of article members to fetch. */
  maxMembers?: number;
  /** Expand subcategories up to the configured depth. */
  includeSubcategories?: boolean;
  depth?: number;
}

export interface WikipediaClientOptions {
  userAgent: string;
  endpoint?: string;
  language?: string;
  concurrency?: number;
  retries?: number;
  timeoutMs?: number;
  /** Minimum delay between HTTP requests in milliseconds (default: 10000ms / 10s). */
  requestDelayMs?: number;
}

export interface WikipediaClient {
  getCategoryMembers(categoryTitle: string, options?: CategoryOptions): Promise<CategoryMember[]>;
  getPagesFromCategories(categories: string[], options?: CategoryOptions): Promise<CategoryMember[]>;
  getPageDetails(pageIds: number[]): Promise<Map<number, PageDetails>>;
  getPageSummary(title: string): Promise<PageSummary | null>;
}
