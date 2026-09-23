import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { MobileMenu } from "@/components/mobile-menu";
import { buttonVariants } from "@/components/ui/button";

const focusAreas = [
  {
    index: "01",
    title: "Laporan kekayaan pejabat",
    description:
      "Dirancang untuk membantu publik menelusuri laporan LHKPN dan membandingkan perubahan antarperiode dengan konteks serta rujukan sumber.",
  },
  {
    index: "02",
    title: "Struktur pemerintahan",
    description:
      "Memahami hubungan antara pejabat, jabatan, instansi, dan tingkat pemerintahan.",
  },
  {
    index: "03",
    title: "Riwayat jabatan",
    description:
      "Melihat perjalanan jabatan dan perubahan informasi dari waktu ke waktu.",
  },
];

const sourceSteps = [
  {
    number: "01",
    title: "Telusuri sumber resmi",
    text: "Mulai dari dokumen dan kanal publik milik lembaga terkait.",
  },
  {
    number: "02",
    title: "Catat asal data",
    text: "Rancangan catatan memuat rujukan sumber dan waktu pelaporan.",
  },
  {
    number: "03",
    title: "Bandingkan periode",
    text: "Perubahan dibaca berdampingan dengan periode sebelumnya.",
  },
  {
    number: "04",
    title: "Jelaskan batas analisis",
    text: "Informasi memberi konteks, bukan kesimpulan hukum.",
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <a className="skip-link" href="#konten">Lewati ke konten</a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="wordmark" href="#atas" aria-label="WikiIndo, kembali ke atas">
            <span className="wordmark-mark" aria-hidden="true" />
            WikiIndo
          </a>
          <nav className="desktop-nav" aria-label="Navigasi utama">
            <a className="nav-link" href="#tentang">Tentang</a>
            <Link className="nav-link" href="/kabinet">Data Kabinet</Link>
            <Link className="nav-link" href="/berita">Portal Berita</Link>
            <a className="nav-link" href="#sumber">Sumber</a>
            <a className="nav-link" href="#kebutuhan">Kebutuhan &amp; Donasi</a>
            <a className="nav-link" href="#komunitas">Terbuka untuk umum</a>
            <Link className="nav-link" href="/changelog">Changelog</Link>
          </nav>
          <Link className={`${buttonVariants({ variant: "red" })} header-cta`} href="/kabinet">
            Lihat Data Kabinet <ArrowDownRight size={16} aria-hidden="true" />
          </Link>
          <MobileMenu />
        </div>
      </header>

      <main id="konten">
        <section className="hero" id="atas" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Cakupan awal yang direncanakan: kabinet Indonesia saat ini</p>
              <h1 id="hero-title">Buat Indonesia <span>Lebih Transparan.</span></h1>
              <p className="hero-copy">
                WikiIndo dirancang untuk menata informasi pejabat, instansi, riwayat jabatan, dan laporan LHKPN, beserta konteks serta rujukan sumbernya.
              </p>
              <div className="hero-actions">
                <Link className={buttonVariants({ variant: "red" })} href="/kabinet">
                  Lihat Data Kabinet <ArrowDownRight size={17} aria-hidden="true" />
                </Link>
                <a className={buttonVariants({ variant: "outline" })} href="#sumber">
                  Cara kami mencatat sumber
                </a>
              </div>
              <p className="hero-footnote">Data belum dipublikasikan. WikiIndo masih disiapkan dengan rujukan yang dapat diperiksa.</p>
            </div>

            <aside className="record-board" aria-label="Contoh struktur informasi WikiIndo, bukan data pejabat">
              <div className="record-topline">
                <span className="record-label">Basis Data Kabinet</span>
                <span className="record-status">63 Pejabat Aktif</span>
              </div>
              <h2 className="record-title">Rekam jejak publik</h2>
              <p className="record-caption">Susunan informasi yang akan membantu pembaca melihat konteks dan asal data.</p>
              <div className="record-rows" aria-hidden="true">
                <div className="record-row"><span>Profil pejabat</span><span>Jabatan dan instansi</span></div>
                <div className="record-row"><span>Laporan LHKPN</span><span>Periode pelaporan</span></div>
                <div className="record-row"><span>Perubahan data</span><span>Perbandingan periode</span></div>
              </div>
              <div className="record-footer"><span className="record-dot" aria-hidden="true" />Rujukan sumber dirancang untuk tiap catatan</div>
            </aside>
          </div>
        </section>

        <section className="section" id="tentang" aria-labelledby="about-title">
          <div className="container">
            <div className="section-heading">
              <p className="section-kicker">Tentang WikiIndo</p>
              <div>
                <h2 id="about-title">Informasi publik perlu mudah ditelusuri.</h2>
                <p>
                  Data pemerintahan tersebar di banyak dokumen dan lembaga. WikiIndo dirancang untuk menghubungkan catatan publik dengan konteks yang jelas, tanpa menggantikan sumber aslinya.
                </p>
              </div>
            </div>
            <section className="data-list" id="data" aria-labelledby="data-title">
              <h3 id="data-title" className="sr-only">Fokus data WikiIndo</h3>
              {focusAreas.map((area) => (
                <article className="data-row" key={area.index}>
                  <span className="data-index">{area.index}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <span className="data-marker" aria-hidden="true" />
                </article>
              ))}
            </section>
          </div>
        </section>

        <section className="section section-muted" id="sumber" aria-labelledby="source-title">
          <div className="container">
            <div className="section-heading">
              <p className="section-kicker">Metode pencatatan</p>
              <div>
                <h2 id="source-title">Analisis dimulai dari sumber.</h2>
                <p>
                  Setiap informasi perlu memiliki jejak asal, waktu, dan batas pembacaan. Inilah cara kerja yang akan menjadi dasar WikiIndo.
                </p>
              </div>
            </div>
            <div className="process-grid">
              {sourceSteps.map((step) => (
                <article className="process-step" key={step.number}>
                  <span className="process-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="method-title">
          <div className="container method-grid">
            <div>
              <p className="section-kicker">Baca dengan konteks</p>
              <h2 id="method-title">Perubahan data bukan putusan hukum.</h2>
            </div>
            <div>
              <p className="method-copy">
                Perubahan nilai kekayaan dapat memiliki banyak konteks. WikiIndo akan menyajikan perbandingan yang tercatat beserta sumbernya, tanpa menyimpulkan pelanggaran atau niat seseorang.
              </p>
              <div className="method-note">
                <p>Gunakan data untuk memahami dan mengajukan pertanyaan yang tepat. Periksa dokumen sumber sebelum menarik kesimpulan.</p>
              </div>
              <span className="source-label"><FileText size={16} aria-hidden="true" />Rujukan sumber menjadi bagian dari informasi</span>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="kebutuhan" aria-labelledby="needs-title">
          <div className="container">
            <div className="section-heading">
              <p className="section-kicker">Dukungan proyek</p>
              <div>
                <h2 id="needs-title">Bantu menjaga WikiIndo tetap tersedia.</h2>
                <p>
                  Sebagai proyek relawan, WikiIndo membutuhkan dukungan untuk biaya dasar operasional.
                </p>
              </div>
            </div>
            <div className="needs-list">
              <article className="need-row">
                <h3>Domain .com</h3>
                <p>Alamat web WikiIndo.</p>
              </article>
              <article className="need-row">
                <h3>Hosting web</h3>
                <p>Layanan untuk menjalankan situs agar dapat diakses publik.</p>
              </article>
            </div>
            <p className="donation-status">Saluran donasi belum tersedia dan sedang disiapkan.</p>
          </div>
        </section>

        <section className="section" id="komunitas" aria-labelledby="community-title">
          <div className="container">
            <div className="section-heading">
              <p className="section-kicker">Berkembang bersama</p>
              <div>
                <h2 id="community-title">Terbuka untuk umum</h2>
                <p>
                  WikiIndo dibangun dengan semangat sumber terbuka. Siapa pun dapat ikut membangunnya bersama demi Indonesia yang lebih baik.
                </p>
              </div>
            </div>
            <div className="contribution-grid">
              <div className="contribution-item">
                <h3>Ikut membangun</h3>
                <ul className="contribution-list">
                  <li>Tambahkan atau koreksi data Markdown pejabat, instansi, atau LHKPN dengan sumber resmi.</li>
                  <li>Laporkan bug atau sampaikan saran melalui formulir GitHub.</li>
                  <li>Buat pull request untuk perubahan data, kode, atau dokumentasi.</li>
                </ul>
                <div className="contribution-links">
                  <a className="repository-link" href="https://github.com/arsyadal/wikiindo" target="_blank" rel="noopener noreferrer">
                    Repositori GitHub <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a className="repository-link" href="https://github.com/arsyadal/wikiindo/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                    Panduan kontribusi <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a className="repository-link" href="https://github.com/arsyadal/wikiindo/blob/main/content/README.md" target="_blank" rel="noopener noreferrer">
                    Panduan data Markdown <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="contribution-item">
                <h3>Kritik &amp; Saran</h3>
                <p>
                  Formulir GitHub memerlukan akun GitHub. Issue yang dikirim akan tampil secara publik.
                </p>
                <a className={`${buttonVariants({ variant: "red" })} contribution-cta`} href="https://github.com/arsyadal/wikiindo/issues/new?template=feedback.yml" target="_blank" rel="noopener noreferrer">
                  Buka formulir kritik dan saran <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="container closing-inner">
            <div>
              <h2 id="closing-title">Transparansi tumbuh saat informasi bisa diperiksa.</h2>
              <p>Kenali fokus data WikiIndo dan cara setiap informasi akan dihubungkan ke sumbernya.</p>
            </div>
            <a className={buttonVariants({ variant: "red" })} href="#data">
              Lihat fokus data <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="wordmark" href="#atas" aria-label="WikiIndo, kembali ke atas">
            <span className="wordmark-mark" aria-hidden="true" />
            WikiIndo
          </a>
          <p className="footer-note">Buat Indonesia Lebih Transparan.</p>
          <nav className="footer-nav" aria-label="Navigasi footer">
            <Link href="/">Beranda</Link>
            <Link href="/kabinet">Data Kabinet</Link>
            <Link href="/berita">Portal Berita</Link>
            <Link href="/changelog">Changelog</Link>
            <a href="#tentang">Tentang</a>
            <a href="#sumber">Sumber</a>
            <a href="#komunitas">Terbuka untuk umum</a>
            <a href="#kebutuhan">Kebutuhan &amp; Donasi</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
