"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function BeritaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] flex flex-col justify-between">
      <header className="sticky top-0 z-20 bg-white/95 border-b border-[#e5e5e5] backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Link className="wordmark" href="/" aria-label="WikiIndo, beranda">
            <span className="wordmark-mark" aria-hidden="true" />
            WikiIndo
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#606060]"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#a60000]">
            <RefreshCw size={22} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-[#0f0f0f]">
            Kendala Memuat Portal Berita
          </h2>
          <p className="mt-2 text-sm text-[#555]">
            Terjadi masalah saat menghubungi sindikasi RSS berita eksternal. Silakan coba lagi.
          </p>
          {error?.message && (
            <p className="mt-3 rounded-md bg-white p-2.5 font-mono text-xs text-red-700 border border-red-200 overflow-x-auto">
              {error.message}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#a60000] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#8d0000] transition-colors"
            >
              <RefreshCw size={14} />
              <span>Muat Ulang Berita</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d6d6d6] bg-white px-4 py-2.5 text-xs font-bold text-[#333] hover:bg-gray-50 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <footer className="site-footer border-t border-[#e5e5e5] mt-20">
        <div className="container footer-inner">
          <Link className="wordmark" href="/" aria-label="WikiIndo, kembali ke beranda">
            <span className="wordmark-mark" aria-hidden="true" />
            WikiIndo
          </Link>
          <p className="footer-note">Buat Indonesia Lebih Transparan.</p>
        </div>
      </footer>
    </div>
  );
}
