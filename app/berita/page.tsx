import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchAllNews, NEWS_SOURCES } from "@/lib/news";
import { BeritaView } from "./berita-view";

export const metadata: Metadata = {
  title: "Portal Berita Nasional | WikiIndo",
  description:
    "Pusat agregasi berita pemerintahan, penegakan hukum, antikorupsi, ekonomi & kebijakan publik dari berbagai media terverifikasi Indonesia.",
};

export const revalidate = 120; // Revalidate feed every 2 minutes

export default async function BeritaPage() {
  const feed = await fetchAllNews();

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] flex flex-col justify-between">
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 border-b border-[#e5e5e5] backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link className="wordmark" href="/" aria-label="WikiIndo, beranda">
              <span className="wordmark-mark" aria-hidden="true" />
              WikiIndo
            </Link>
            <nav
              className="hidden sm:flex items-center gap-5 text-sm font-medium text-[#444]"
              aria-label="Navigasi sekunder"
            >
              <Link href="/" className="hover:text-[#cc0000] transition-colors">
                Beranda
              </Link>
              <Link href="/kabinet" className="hover:text-[#cc0000] transition-colors">
                Kabinet
              </Link>
              <span className="text-[#a60000]">Portal Berita</span>
              <Link href="/changelog" className="hover:text-[#cc0000] transition-colors">
                Changelog
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#606060] hover:text-[#0f0f0f] transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="konten" className="container flex-1 py-8 sm:py-12">
        <BeritaView
          initialItems={feed.items}
          sources={feed.sources || NEWS_SOURCES}
          lastUpdated={feed.lastUpdated}
        />
      </main>

      {/* Footer */}
      <footer className="site-footer border-t border-[#e5e5e5] mt-20">
        <div className="container footer-inner">
          <Link className="wordmark" href="/" aria-label="WikiIndo, kembali ke beranda">
            <span className="wordmark-mark" aria-hidden="true" />
            WikiIndo
          </Link>
          <p className="footer-note">Buat Indonesia Lebih Transparan.</p>
          <nav className="footer-nav" aria-label="Navigasi footer">
            <Link href="/">Beranda</Link>
            <Link href="/kabinet">Data Kabinet</Link>
            <Link href="/berita">Portal Berita</Link>
            <Link href="/changelog">Changelog</Link>
            <a
              href="https://github.com/wikilhkpn/wikiindo"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
