/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Check,
  Clock,
  Coins,
  Copy,
  Filter,
  Flag,
  Globe,
  LayoutGrid,
  List,
  RefreshCw,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { NewsCategory, NewsItem, NewsSourceInfo } from "@/lib/news";
import { NEWS_CATEGORIES } from "@/lib/news";

interface BeritaViewProps {
  initialItems: NewsItem[];
  sources: NewsSourceInfo[];
  lastUpdated: string;
}

type ViewMode = "grid" | "list";
type ActiveTab = "semua" | "tersimpan";

const CATEGORY_ICONS: Record<NewsCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  Semua: Globe,
  Pemerintahan: Building2,
  "Hukum & Korupsi": Scale,
  "Ekonomi & Kebijakan": Coins,
  Nasional: Flag,
};

const CATEGORY_COLORS: Record<NewsCategory, { bg: string; text: string; border: string }> = {
  Semua: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
  Pemerintahan: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Hukum & Korupsi": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Ekonomi & Kebijakan": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Nasional: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
};

const STORAGE_KEY = "wikiindo_bookmarked_news_v1";

export function BeritaView({ initialItems, sources, lastUpdated: initialLastUpdated }: BeritaViewProps) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<string>(initialLastUpdated);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("Semua");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<ActiveTab>("semua");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<NewsItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NewsItem[];
        if (Array.isArray(parsed)) {
          setBookmarkedItems(parsed);
          setBookmarkedIds(parsed.map((item) => item.id));
        }
      }
    } catch {
      // ignore localStorage parse error
    }
  }, []);

  // Save bookmarks to localStorage
  const saveBookmarksToStorage = (updated: NewsItem[]) => {
    setBookmarkedItems(updated);
    setBookmarkedIds(updated.map((item) => item.id));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore quota error
    }
  };

  const toggleBookmark = (item: NewsItem) => {
    const isBookmarked = bookmarkedIds.includes(item.id);
    let updated: NewsItem[];
    if (isBookmarked) {
      updated = bookmarkedItems.filter((b) => b.id !== item.id);
      showToast("Berita dihapus dari tersimpan");
    } else {
      updated = [item, ...bookmarkedItems];
      showToast("Berita berhasil disimpan");
    }
    saveBookmarksToStorage(updated);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const copyShareLink = async (item: NewsItem) => {
    try {
      await navigator.clipboard.writeText(item.link);
      setCopiedId(item.id);
      showToast("Tautan berita disalin ke papan klip!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      showToast("Gagal menyalin tautan");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/berita?refresh=true");
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setLastUpdated(data.lastUpdated || new Date().toISOString());
          showToast(`Feed diperbarui! ${data.items.length} berita terkini.`);
        }
      } else {
        showToast("Gagal memperbarui feed berita.");
      }
    } catch {
      showToast("Koneksi gagal saat memperbarui feed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Distinct sources list for filter
  const uniqueSources = useMemo(() => {
    const sourceMap = new Map<string, string>();
    for (const s of sources) {
      sourceMap.set(s.name, s.id);
    }
    return Array.from(sourceMap.entries()).map(([name, id]) => ({ name, id }));
  }, [sources]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const baseList = activeTab === "tersimpan" ? bookmarkedItems : items;
    const counts: Record<string, number> = { Semua: baseList.length };
    for (const cat of NEWS_CATEGORIES) {
      if (cat !== "Semua") {
        counts[cat] = baseList.filter((i) => i.category === cat).length;
      }
    }
    return counts;
  }, [items, bookmarkedItems, activeTab]);

  // Filter items
  const filteredItems = useMemo(() => {
    const sourcePool = activeTab === "tersimpan" ? bookmarkedItems : items;

    return sourcePool.filter((item) => {
      // Category filter
      if (selectedCategory !== "Semua" && item.category !== selectedCategory) {
        return false;
      }

      // Source filter
      if (selectedSource !== "all") {
        if (item.source.name !== selectedSource && item.source.id !== selectedSource) {
          return false;
        }
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSnippet = item.snippet.toLowerCase().includes(q);
        const matchesSource = item.source.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSnippet && !matchesSource && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [items, bookmarkedItems, activeTab, selectedCategory, selectedSource, search]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Semua");
    setSelectedSource("all");
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#0f0f0f] px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3"
        >
          <Sparkles size={16} className="text-[#ff4d4d]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Header Section */}
      <div className="border-b border-[#e5e5e5] pb-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3 py-1 text-xs font-semibold text-[#a60000] mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cc0000]"></span>
              </span>
              Agregator Berita Real-Time
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0f0f0f] sm:text-4xl lg:text-5xl">
              Portal Berita Nasional
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#555]">
              Kumpulan kabar terpercaya seputar kebijakan pemerintahan, penegakan hukum &amp; korupsi, ekonomi, serta isu nasional dari media terverifikasi Indonesia.
            </p>
          </div>

          {/* Quick Metrics & Refresh Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs text-[#666]">
              <span className="font-semibold text-[#0f0f0f]">{items.length}+ Berita Terpantau</span>
              <span>14 Kanal • Sinkron {new Date(lastUpdated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#d6d6d6] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#333] shadow-sm hover:border-[#a60000] hover:text-[#a60000] active:scale-95 transition-all disabled:opacity-50"
              title="Segarkan data feed berita terbaru"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#a60000]" : ""} aria-hidden="true" />
              <span>{isRefreshing ? "Menyinkronkan..." : "Segarkan"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection: Semua Berita vs Tersimpan */}
        <div className="mt-8 flex items-center justify-between border-b border-[#e5e5e5] gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`relative inline-flex items-center gap-2 pb-3 pt-1 text-sm font-semibold transition-colors ${
                activeTab === "semua"
                  ? "text-[#a60000] border-b-2 border-[#a60000]"
                  : "text-[#666] hover:text-[#0f0f0f]"
              }`}
            >
              <span>Semua Berita</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tersimpan")}
              className={`relative inline-flex items-center gap-2 pb-3 pt-1 text-sm font-semibold transition-colors ${
                activeTab === "tersimpan"
                  ? "text-[#a60000] border-b-2 border-[#a60000]"
                  : "text-[#666] hover:text-[#0f0f0f]"
              }`}
            >
              <Bookmark size={15} aria-hidden="true" />
              <span>Tersimpan</span>
              {bookmarkedItems.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-[#a60000]">
                  {bookmarkedItems.length}
                </span>
              )}
            </button>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 mb-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#0f0f0f] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Kisi (Grid)"
              aria-label="Tampilan Kisi"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[#0f0f0f] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Daftar (List)"
              aria-label="Tampilan Daftar"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} aria-hidden="true" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul berita, topik, instansi, atau isu..."
              className="w-full rounded-xl border border-[#d6d6d6] bg-white py-2.5 pl-10 pr-9 text-sm text-[#0f0f0f] placeholder:text-gray-400 focus:border-[#a60000] focus:outline-none focus:ring-1 focus:ring-[#a60000]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-700"
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Source filter dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="source-filter" className="text-xs font-semibold text-gray-600 shrink-0 flex items-center gap-1">
              <Filter size={13} aria-hidden="true" />
              <span>Sumber:</span>
            </label>
            <select
              id="source-filter"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="rounded-xl border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-medium text-[#0f0f0f] focus:border-[#a60000] focus:outline-none focus:ring-1 focus:ring-[#a60000]"
            >
              <option value="all">Semua Media ({uniqueSources.length})</option>
              {uniqueSources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills / Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {NEWS_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const isSelected = selectedCategory === category;
            const count = categoryCounts[category] || 0;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#a60000] text-white shadow-xs"
                    : "bg-white border border-[#d6d6d6] text-[#444] hover:border-[#a60000] hover:text-[#a60000]"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-white" : "text-[#777]"} />
                <span>{category}</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header / Active Filter summary */}
      <div className="py-4 flex items-center justify-between text-xs text-[#666]">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan <strong className="text-[#0f0f0f]">{filteredItems.length}</strong> berita
            {selectedCategory !== "Semua" && ` dalam kategori "${selectedCategory}"`}
            {selectedSource !== "all" && ` dari ${selectedSource}`}
            {search && ` untuk "${search}"`}
          </span>
          {(search || selectedCategory !== "Semua" || selectedSource !== "all") && (
            <button
              onClick={resetFilters}
              className="font-medium text-[#a60000] hover:underline ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Feed Container */}
      {filteredItems.length === 0 ? (
        /* Empty State */
        <div className="my-16 rounded-2xl border border-dashed border-[#d6d6d6] bg-[#fafafa] p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#a60000]">
            {activeTab === "tersimpan" ? (
              <Bookmark size={26} aria-hidden="true" />
            ) : (
              <Search size={26} aria-hidden="true" />
            )}
          </div>
          <h2 className="text-lg font-bold text-[#0f0f0f]">
            {activeTab === "tersimpan"
              ? "Belum ada berita yang disimpan"
              : "Tidak ada berita ditemukan"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#666]">
            {activeTab === "tersimpan"
              ? "Klik ikon bookmark pada kartu berita mana pun untuk menyimpannya ke daftar baca nanti di perangkat ini."
              : "Coba ubah kata kunci pencarian, pilih kategori lain, atau ganti filter sumber media."}
          </p>
          {(search || selectedCategory !== "Semua" || selectedSource !== "all") && (
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0f0f0f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a60000] transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Tampilkan Semua Berita</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Daily.dev Style Grid Layout */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isCopied = copiedId === item.id;
            const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Semua"];

            return (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#bdbdbd] hover:shadow-md"
              >
                <div>
                  {/* Card Thumbnail / Header Visual */}
                  <div className="relative mb-3.5 aspect-video w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // If image fails to load, replace with fallback
                          (e.currentTarget as HTMLElement).style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(".img-fallback");
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}

                    {/* Fallback geometric illustration if no image or error */}
                    <div
                      className={`img-fallback ${
                        item.thumbnail ? "hidden" : "flex"
                      } h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1c1c1c] to-[#3a3a3a] p-4 text-center text-white`}
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                        {item.source.badge.slice(0, 3)}
                      </div>
                      <span className="text-xs font-semibold text-gray-200">{item.source.name}</span>
                      <span className="mt-1 text-[11px] text-gray-400">{item.category}</span>
                    </div>

                    {/* Source pill badge on thumbnail */}
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md bg-[#0f0f0f]/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: item.source.color || "#ff0000" }}
                      />
                      <span>{item.source.name}</span>
                    </div>

                    {/* Reading time badge on thumbnail */}
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-800 shadow-xs backdrop-blur-md">
                      <Clock size={11} className="text-gray-500" />
                      <span>{item.readingTime} mnt</span>
                    </div>
                  </div>

                  {/* Meta Topline: Timestamp & Category */}
                  <div className="mb-2 flex items-center justify-between text-xs text-[#777]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[#444]">{item.timeAgo}</span>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#0f0f0f] group-hover:text-[#a60000] transition-colors">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus:outline-hidden focus:underline"
                    >
                      {item.title}
                    </a>
                  </h3>

                  {/* Article Snippet */}
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#606060]">
                    {item.snippet}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                  <div className="flex items-center gap-1">
                    {/* Bookmark Action */}
                    <button
                      onClick={() => toggleBookmark(item)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isBookmarked
                          ? "bg-red-50 text-[#a60000] hover:bg-red-100"
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                      title={isBookmarked ? "Hapus dari tersimpan" : "Simpan untuk dibaca nanti"}
                      aria-label={isBookmarked ? "Hapus dari tersimpan" : "Simpan berita"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={16} className="fill-current text-[#a60000]" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>

                    {/* Share Action */}
                    <button
                      onClick={() => copyShareLink(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="Salin tautan berita"
                      aria-label="Salin tautan berita"
                    >
                      {isCopied ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {/* Direct Link to Original Publisher */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-[#0f0f0f] hover:bg-[#a60000] hover:text-white transition-colors"
                  >
                    <span>Baca Sumber</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Daily.dev Compact List Layout */
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isCopied = copiedId === item.id;
            const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Semua"];

            return (
              <article
                key={item.id}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-2xs hover:border-[#bdbdbd] hover:shadow-xs transition-all"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Mini Thumbnail */}
                  {item.thumbnail ? (
                    <div className="hidden sm:block h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    {/* Topline */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#777] mb-1">
                      <span className="font-bold text-[#0f0f0f]">{item.source.name}</span>
                      <span>•</span>
                      <span>{item.timeAgo}</span>
                      <span>•</span>
                      <span
                        className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                      >
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-gray-500">{item.readingTime} mnt baca</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-[#0f0f0f] group-hover:text-[#a60000] transition-colors truncate">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus:outline-hidden focus:underline"
                      >
                        {item.title}
                      </a>
                    </h3>

                    {/* Snippet */}
                    <p className="mt-1 line-clamp-1 text-xs text-[#606060]">
                      {item.snippet}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleBookmark(item)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isBookmarked
                        ? "bg-red-50 text-[#a60000]"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                    title={isBookmarked ? "Hapus tersimpan" : "Simpan berita"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={16} className="fill-current text-[#a60000]" />
                    ) : (
                      <Bookmark size={16} />
                    )}
                  </button>

                  <button
                    onClick={() => copyShareLink(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Salin tautan"
                  >
                    {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-[#0f0f0f] hover:bg-[#a60000] hover:text-white transition-colors"
                  >
                    <span>Buka</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Editorial Note & Source Disclaimer */}
      <div className="mt-16 rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] p-6 text-xs leading-relaxed text-[#666]">
        <h4 className="font-bold uppercase tracking-wider text-[#0f0f0f] mb-2">
          Catatan Kurasi &amp; Penafian Hak Cipta
        </h4>
        <p>
          Seluruh konten berita yang ditampilkan pada portal agregator WikiIndo bersumber dari sindikasi publik (RSS Feed) resmi media nasional Indonesia. Hak cipta naskah, foto, dan konten sepenuhnya milik masing-masing redaksi penerbit. WikiIndo tidak mengubah isi naskah dan selalu menautkan rujukan langsung ke laman asli penerbit demi mendukung transparansi dan atribusi karya jurnalistik.
        </p>
      </div>
    </div>
  );
}
