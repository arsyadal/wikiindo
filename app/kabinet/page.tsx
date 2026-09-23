import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadContent } from "@/lib/content";
import { KabinetView } from "./kabinet-view";

export const metadata: Metadata = {
  title: "Data Kabinet | WikiIndo",
  description: "Daftar resmi pejabat, instansi, dan LHKPN Kabinet Pemerintahan Indonesia dengan rujukan sumber terverifikasi.",
};

export default async function KabinetPage() {
  const content = await loadContent();
  const empty = content.pejabat.length === 0 && content.instansi.length === 0;

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] flex flex-col justify-between">
      <a className="skip-link" href="#konten">Lewati ke konten</a>
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 border-b border-[#e5e5e5] backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link className="wordmark" href="/" aria-label="WikiIndo, beranda">
              <span className="wordmark-mark" aria-hidden="true" />
              WikiIndo
            </Link>
            <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-[#444]" aria-label="Navigasi sekunder">
              <Link href="/" className="hover:text-[#cc0000] transition-colors">Beranda</Link>
              <span className="text-[#a60000]">Kabinet</span>
              <Link href="/changelog" className="hover:text-[#cc0000] transition-colors">Changelog</Link>
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
      <main id="konten" className="container flex-1 py-10 sm:py-16">
        <div className="max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#a60000]">Catatan bersumber</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-[#0f0f0f]">
            Kabinet Merah Putih
          </h1>
          <p className="mt-4 text-base leading-7 text-[#606060]">
            Daftar resmi Presiden, Wakil Presiden, Menteri, Pejabat Setingkat Menteri, dan Sekretaris Kabinet Republik Indonesia bersumber dari rujukan publik Sekretariat Kabinet (<a href="https://setkab.go.id/profil-kabinet/" target="_blank" rel="noopener noreferrer" className="text-[#065fd4] hover:underline">setkab.go.id</a>).
          </p>
        </div>

        {empty ? (
          <section className="mt-12 max-w-2xl border-t border-[#e5e5e5] py-8" aria-labelledby="status-data">
            <h2 id="status-data" className="text-2xl font-bold">Belum ada catatan terverifikasi</h2>
            <p className="mt-3 leading-7 text-[#606060]">
              Data pejabat, instansi, dan LHKPN belum dimasukkan ke kumpulan data ini. Kami tidak menampilkan nama atau angka tanpa rujukan.
            </p>
            <Link className="mt-5 inline-flex min-h-11 items-center font-medium text-[#a60000] underline underline-offset-4" href="/">
              Kembali ke beranda
            </Link>
          </section>
        ) : (
          <KabinetView content={content} />
        )}
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
            <Link href="/changelog">Changelog</Link>
            <a href="https://github.com/wikilhkpn/wikiindo" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
