import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ArrowLeft, Calendar } from "lucide-react";
import Markdown from "react-markdown";

export const metadata: Metadata = {
  title: "Changelog | WikiIndo",
  description: "Catatan riwayat perubahan dan pembaruan platform WikiIndo.",
};

interface ChangelogEntry {
  date: string;
  formattedDate: string;
  content: string;
}

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeZone: "UTC",
});

async function getChangelog(): Promise<{ intro: string; entries: ChangelogEntry[] }> {
  try {
    const raw = await readFile(path.join(process.cwd(), "changelog.md"), "utf8");
    const lines = raw.split("\n");

    let intro = "";
    const entries: ChangelogEntry[] = [];
    let currentDate = "";
    let currentLines: string[] = [];

    let inHeader = true;

    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (currentDate) {
          entries.push({
            date: currentDate,
            formattedDate: formatDate(currentDate),
            content: currentLines.join("\n").trim(),
          });
          currentLines = [];
        }
        currentDate = line.replace("## ", "").trim();
        inHeader = false;
      } else if (inHeader) {
        if (!line.startsWith("# ")) {
          intro += line + "\n";
        }
      } else {
        currentLines.push(line);
      }
    }

    if (currentDate) {
      entries.push({
        date: currentDate,
        formattedDate: formatDate(currentDate),
        content: currentLines.join("\n").trim(),
      });
    }

    return { intro: intro.trim(), entries };
  } catch {
    return {
      intro: "Catatan riwayat perubahan platform WikiIndo.",
      entries: [],
    };
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (isNaN(d.getTime())) return dateStr;
    return tanggalFormatter.format(d);
  } catch {
    return dateStr;
  }
}

export default async function ChangelogPage() {
  const { intro, entries } = await getChangelog();

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
              <Link href="/kabinet" className="hover:text-[#cc0000] transition-colors">Kabinet</Link>
              <Link href="/berita" className="hover:text-[#cc0000] transition-colors">Portal Berita</Link>
              <span className="text-[#a60000]">Changelog</span>
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
      <main id="konten" className="container flex-1 py-10 sm:py-16 max-w-4xl">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#a60000]">Riwayat Pembaruan</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-[#0f0f0f]">
            Changelog
          </h1>
          {intro && (
            <p className="mt-4 text-base leading-7 text-[#606060]">
              {intro}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="mt-12 space-y-12 border-l-2 border-[#e5e5e5] pl-6 sm:pl-8 ml-3 sm:ml-4">
          {entries.map((entry) => (
            <article key={entry.date} className="relative group">
              {/* Timeline marker */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#a60000] group-hover:scale-125 transition-transform"
                aria-hidden="true"
              />
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#fff0f0] text-[#8d0000] rounded-full">
                  <Calendar size={13} aria-hidden="true" />
                  {entry.date}
                </span>
                <span className="text-xs text-[#606060]">
                  {entry.formattedDate}
                </span>
              </div>

              <div className="mt-4 p-6 bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl text-sm leading-7 text-[#333] space-y-3 prose prose-neutral max-w-none">
                <Markdown
                  components={{
                    ul: ({ children }) => <ul className="space-y-2 my-2 list-disc pl-5">{children}</ul>,
                    li: ({ children }) => <li className="text-[#333]">{children}</li>,
                    code: ({ children }) => <code className="px-1.5 py-0.5 bg-[#e5e5e5] text-[#0f0f0f] rounded text-xs font-mono">{children}</code>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    a: ({ href, children }) => (
                      <a href={href} className="text-[#065fd4] hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {entry.content}
                </Markdown>
              </div>
            </article>
          ))}
        </div>
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
            <a href="https://github.com/wikilhkpn/wikiindo" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
