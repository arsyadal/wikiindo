export type NewsCategory =
  | "Semua"
  | "Pemerintahan"
  | "Hukum & Korupsi"
  | "Ekonomi & Kebijakan"
  | "Nasional";

export interface NewsSourceInfo {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: NewsCategory;
  color: string;
  badge: string;
  description?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  isoDate: string;
  timeAgo: string;
  source: {
    id: string;
    name: string;
    domain: string;
    category: NewsCategory;
    color: string;
    badge: string;
  };
  category: NewsCategory;
  snippet: string;
  thumbnail?: string;
  readingTime: number; // in minutes
}

export interface NewsFeedResult {
  items: NewsItem[];
  total: number;
  sources: NewsSourceInfo[];
  lastUpdated: string;
  isCached?: boolean;
}

export interface FetchNewsOptions {
  category?: NewsCategory | "Semua";
  sourceId?: string;
  search?: string;
  limit?: number;
}
