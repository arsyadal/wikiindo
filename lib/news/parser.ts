import type { NewsItem, NewsSourceInfo } from "./types";

export function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

export function extractImage(itemXml: string): string | undefined {
  if (!itemXml) return undefined;

  // 1. Check enclosure tag
  const encMatch =
    itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\/[^"']+["']/i) ||
    itemXml.match(/<enclosure[^>]*type=["']image\/[^"']+["'][^>]*url=["']([^"']+)["']/i) ||
    itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (encMatch && encMatch[1]) {
    const url = encMatch[1].replace(/&amp;/g, "&").trim();
    if (isValidImageUrl(url)) return url;
  }

  // 2. Check media:content or media:thumbnail
  const mediaMatch =
    itemXml.match(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["']/i) ||
    itemXml.match(/<media:content[^>]*\/>/i);
  if (mediaMatch && mediaMatch[1]) {
    const url = mediaMatch[1].replace(/&amp;/g, "&").trim();
    if (isValidImageUrl(url)) return url;
  }

  // 3. Check <img> tag inside CDATA or description
  const imgMatch = itemXml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const url = imgMatch[1].replace(/&amp;/g, "&").trim();
    if (isValidImageUrl(url)) return url;
  }

  return undefined;
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  // Exclude 1x1 tracker pixels
  if (url.includes("1x1") || url.includes("pixel.gif") || url.includes("tracking")) return false;
  return true;
}

export function formatTimeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Terkini";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Baru saja";
  }
  if (diffMin < 60) {
    return `${diffMin} mnt lalu`;
  }
  if (diffHour < 24) {
    return `${diffHour} jam lalu`;
  }
  if (diffDay === 1) {
    return "Kemarin";
  }
  if (diffDay < 7) {
    return `${diffDay} hari lalu`;
  }

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatter.format(date);
}

export function generateItemId(link: string, title: string): string {
  const base = (link || title).toLowerCase();
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `news-${Math.abs(hash).toString(36)}`;
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  // Estimate ~200 words per minute for news articles (assuming full article is ~3x snippet length)
  const fullArticleEstimate = words * 4;
  const minutes = Math.ceil(fullArticleEstimate / 200);
  return Math.max(1, Math.min(minutes, 7));
}

export function parseFeedXml(xml: string, source: NewsSourceInfo): NewsItem[] {
  if (!xml || typeof xml !== "string") return [];

  const items: NewsItem[] = [];
  const itemMatches =
    xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch =
      itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch =
      itemXml.match(/<link[^>]*href=["']([^"']+)["']/i) ||
      itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
      itemXml.match(/<guid[^>]*isPermaLink="true">([\s\S]*?)<\/guid>/i);
    const pubDateMatch =
      itemXml.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i) ||
      itemXml.match(/<published[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/published>/i) ||
      itemXml.match(/<updated[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/updated>/i);
    const descMatch =
      itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
      itemXml.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i) ||
      itemXml.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);

    const title = cleanHtml(titleMatch ? titleMatch[1] : "");
    let link = "";
    if (linkMatch) {
      link = (linkMatch[1] || linkMatch[0] || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
    }

    if (!title || !link || link.startsWith("<")) continue;

    // Date parsing
    const rawPubDate = pubDateMatch ? cleanHtml(pubDateMatch[1]) : "";
    let isoDate = new Date().toISOString();
    if (rawPubDate) {
      const parsed = new Date(rawPubDate);
      if (!isNaN(parsed.getTime())) {
        isoDate = parsed.toISOString();
      }
    }

    const rawSnippet = descMatch ? descMatch[1] : "";
    let snippet = cleanHtml(rawSnippet);
    if (snippet.length > 240) {
      snippet = snippet.slice(0, 237) + "...";
    }

    const thumbnail = extractImage(itemXml);
    const timeAgo = formatTimeAgo(isoDate);
    const id = generateItemId(link, title);
    const readingTime = estimateReadingTime(`${title} ${snippet}`);

    items.push({
      id,
      title,
      link,
      pubDate: rawPubDate || isoDate,
      isoDate,
      timeAgo,
      source: {
        id: source.id,
        name: source.name,
        domain: source.domain,
        category: source.category,
        color: source.color,
        badge: source.badge,
      },
      category: source.category,
      snippet: snippet || `Berita terkini dari ${source.name} terkait ${source.category.toLowerCase()}.`,
      thumbnail,
      readingTime,
    });
  }

  return items;
}
