import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BeritaLoading() {
  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 border-b border-[#e5e5e5] backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link className="wordmark" href="/" aria-label="WikiIndo, beranda">
              <span className="wordmark-mark" aria-hidden="true" />
              WikiIndo
            </Link>
            <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-[#444]">
              <Link href="/">Beranda</Link>
              <Link href="/kabinet">Kabinet</Link>
              <span className="text-[#a60000]">Portal Berita</span>
              <Link href="/changelog">Changelog</Link>
            </nav>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#606060]"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="container flex-1 py-8 sm:py-12">
        <div className="w-full animate-pulse">
          {/* Top Headline Skeleton */}
          <div className="border-b border-[#e5e5e5] pb-8 pt-2">
            <div className="h-6 w-48 rounded-full bg-gray-200 mb-4" />
            <div className="h-10 w-3/4 max-w-xl rounded-xl bg-gray-200 mb-3" />
            <div className="h-4 w-full max-w-2xl rounded-md bg-gray-100 mb-2" />
            <div className="h-4 w-2/3 max-w-xl rounded-md bg-gray-100" />

            {/* Filter pills skeleton */}
            <div className="mt-8 flex gap-2">
              <div className="h-8 w-28 rounded-full bg-gray-200" />
              <div className="h-8 w-32 rounded-full bg-gray-200" />
              <div className="h-8 w-36 rounded-full bg-gray-200" />
              <div className="h-8 w-36 rounded-full bg-gray-200" />
            </div>

            {/* Search bar skeleton */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="h-11 w-full max-w-md rounded-xl bg-gray-200" />
              <div className="h-11 w-44 rounded-xl bg-gray-200" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full rounded-xl bg-gray-200 mb-3.5" />
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-16 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded-full bg-gray-200" />
                  </div>
                  <div className="h-5 w-full rounded bg-gray-200 mb-2" />
                  <div className="h-5 w-4/5 rounded bg-gray-200 mb-3" />
                  <div className="h-3 w-full rounded bg-gray-100 mb-1" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                </div>
                <div className="mt-4 border-t border-[#f0f0f0] pt-3 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gray-200" />
                    <div className="h-7 w-7 rounded-lg bg-gray-200" />
                  </div>
                  <div className="h-7 w-24 rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
