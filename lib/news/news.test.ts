import { describe, expect, test } from "bun:test";
import {
  cleanHtml,
  estimateReadingTime,
  extractImage,
  fetchAllNews,
  formatTimeAgo,
  generateItemId,
  NEWS_SOURCES,
  parseFeedXml,
} from "./index";

describe("lib/news parser and utilities", () => {
  test("cleanHtml strips tags and unescapes all XML and HTML entities", () => {
    const raw = "<p>Halo &amp; Selamat <strong>Datang</strong> di &#39;WikiIndo&#39; &quot;Indonesia&quot; &lt;2026&gt;&nbsp;!</p>";
    expect(cleanHtml(raw)).toBe("Halo & Selamat Datang di 'WikiIndo' \"Indonesia\" <2026> !");
  });

  test("cleanHtml handles CDATA blocks correctly", () => {
    const raw = "<![CDATA[<p>Teks Berita Penting &amp; Terverifikasi</p>]]>";
    expect(cleanHtml(raw)).toBe("Teks Berita Penting & Terverifikasi");
  });

  test("extractImage finds enclosure image URLs", () => {
    const xml = `<item>
      <title>Uji</title>
      <enclosure url="https://cdn.example.com/foto.jpg?w=600&amp;q=80" type="image/jpeg" length="12345" />
    </item>`;
    expect(extractImage(xml)).toBe("https://cdn.example.com/foto.jpg?w=600&q=80");
  });

  test("extractImage finds media:content and img in description", () => {
    const mediaXml = `<item>
      <media:content url="https://cdn.example.com/media.png" medium="image" />
    </item>`;
    expect(extractImage(mediaXml)).toBe("https://cdn.example.com/media.png");

    const imgXml = `<item>
      <description><![CDATA[<img src="https://cdn.example.com/desc.webp" /> Berita]]></description>
    </item>`;
    expect(extractImage(imgXml)).toBe("https://cdn.example.com/desc.webp");
  });

  test("generateItemId creates deterministic identifier", () => {
    const id1 = generateItemId("https://example.com/berita-1", "Berita 1");
    const id2 = generateItemId("https://example.com/berita-1", "Berita 1");
    const id3 = generateItemId("https://example.com/berita-2", "Berita 2");

    expect(id1).toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id1.startsWith("news-")).toBe(true);
  });

  test("estimateReadingTime computes realistic reading duration", () => {
    expect(estimateReadingTime("Judul pendek")).toBe(1);
    expect(
      estimateReadingTime(
        "Judul panjang dengan banyak kata yang menjelaskan tentang kebijakan baru di bidang ekonomi dan penegakan hukum di Indonesia secara terperinci."
      )
    ).toBeGreaterThanOrEqual(1);
  });

  test("formatTimeAgo handles various time differences in Indonesian", () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe("Baru saja");

    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatTimeAgo(tenMinsAgo)).toBe("10 mnt lalu");

    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatTimeAgo(threeHoursAgo)).toBe("3 jam lalu");

    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    expect(formatTimeAgo(yesterday)).toBe("Kemarin");

    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(threeDaysAgo)).toBe("3 hari lalu");
  });

  test("parseFeedXml parses RSS items with full metadata", () => {
    const mockSource = NEWS_SOURCES[0];
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>ANTARA News</title>
        <item>
          <title><![CDATA[Presiden Prabowo Pimpin Sidang Kabinet Paripurna]]></title>
          <link>https://www.antaranews.com/berita/12345/presiden-prabowo-sidang</link>
          <pubDate>Wed, 23 Sep 2026 10:00:00 +0700</pubDate>
          <description><![CDATA[<img src="https://cdn.antaranews.com/foto.jpg" /> Presiden memaparkan arahan program kerja prioritas.]]></description>
        </item>
      </channel>
    </rss>`;

    const items = parseFeedXml(sampleXml, mockSource);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("Presiden Prabowo Pimpin Sidang Kabinet Paripurna");
    expect(items[0].link).toBe("https://www.antaranews.com/berita/12345/presiden-prabowo-sidang");
    expect(items[0].thumbnail).toBe("https://cdn.antaranews.com/foto.jpg");
    expect(items[0].source.name).toBe("ANTARA News");
    expect(items[0].category).toBe("Pemerintahan");
    expect(items[0].snippet).toContain("Presiden memaparkan arahan program kerja prioritas.");
  });

  test("fetchAllNews returns aggregated feed with fallback resilience", async () => {
    const result = await fetchAllNews();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.sources.length).toBe(NEWS_SOURCES.length);

    // Test category filter
    const govResult = await fetchAllNews({ category: "Pemerintahan" });
    for (const item of govResult.items) {
      expect(item.category).toBe("Pemerintahan");
    }

    // Test limit
    const limitedResult = await fetchAllNews({ limit: 5 });
    expect(limitedResult.items.length).toBeLessThanOrEqual(5);
  });
});
