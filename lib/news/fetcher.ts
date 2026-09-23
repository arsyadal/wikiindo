import type {
  FetchNewsOptions,
  NewsFeedResult,
  NewsItem,
  NewsSourceInfo,
} from "./types";
import { NEWS_SOURCES } from "./sources";
import { formatTimeAgo, parseFeedXml } from "./parser";
import { FALLBACK_NEWS_ITEMS } from "./sample-data";

// In-memory cache with 2-minute TTL for server-side deduplication and speed
let cachedResult: {
  timestamp: number;
  items: NewsItem[];
} | null = null;

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function fetchFeed(
  source: NewsSourceInfo,
  timeoutMs = 4000
): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(source.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WikiIndo/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
      next: { revalidate: 120 }, // Next.js ISR revalidation
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return parseFeedXml(xml, source);
  } catch {
    // Fail quietly per source to avoid breaking the entire feed
    return [];
  }
}

export async function fetchAllNews(
  options: FetchNewsOptions = {}
): Promise<NewsFeedResult> {
  const now = Date.now();
  let rawItems: NewsItem[] = [];
  let isCached = false;

  // Check in-memory cache
  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL_MS) {
    rawItems = cachedResult.items;
    isCached = true;
  } else {
    // Fetch all sources concurrently
    const settled = await Promise.allSettled(
      NEWS_SOURCES.map((source) => fetchFeed(source, 4000))
    );

    const gathered: NewsItem[] = [];
    for (const result of settled) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        gathered.push(...result.value);
      }
    }

    // If gathered items is small (e.g. offline/network blocked), merge fallback items
    if (gathered.length < 10) {
      gathered.push(...FALLBACK_NEWS_ITEMS);
    }

    // Deduplicate by clean link or title
    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();
    const deduplicated: NewsItem[] = [];

    for (const item of gathered) {
      const cleanLink = item.link.split("?")[0].replace(/\/$/, "").toLowerCase();
      const normTitle = item.title.toLowerCase().trim();

      if (seenLinks.has(cleanLink) || seenTitles.has(normTitle)) {
        continue;
      }

      seenLinks.add(cleanLink);
      seenTitles.add(normTitle);
      deduplicated.push(item);
    }

    // Sort by latest isoDate descending
    deduplicated.sort(
      (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
    );

    rawItems = deduplicated;
    cachedResult = {
      timestamp: now,
      items: deduplicated,
    };
  }

  // Refresh relative timeAgo for current moment
  let items = rawItems.map((item) => ({
    ...item,
    timeAgo: formatTimeAgo(item.isoDate),
  }));

  // Apply category filter
  if (options.category && options.category !== "Semua") {
    items = items.filter((item) => item.category === options.category);
  }

  // Apply source filter
  if (options.sourceId) {
    items = items.filter((item) => item.source.id === options.sourceId);
  }

  // Apply search query
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.source.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    items = items.slice(0, options.limit);
  }

  return {
    items,
    total: items.length,
    sources: NEWS_SOURCES,
    lastUpdated: new Date().toISOString(),
    isCached,
  };
}

export function clearNewsCache(): void {
  cachedResult = null;
}
