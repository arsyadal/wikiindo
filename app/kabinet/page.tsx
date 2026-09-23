import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import { findInstansi, loadContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Data Kabinet | WikiIndo",
  description: "Catatan pejabat, instansi, dan LHKPN yang sudah memiliki rujukan sumber.",
};

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" });

export default async function KabinetPage() {
  const content = await loadContent();
  const empty = content.pejabat.length === 0 && content.instansi.length === 0;

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f]">
      <a className="skip-link" href="#konten">Lewati ke konten</a>
      <header className="border-b border-[#d6d6d6]">
        <div className="container flex min-h-[76px] items-center justify-between gap-4">
          <Link className="wordmark" href="/" aria-label="WikiIndo, beranda">
            <span className="wordmark-mark" aria-hidden="true" />WikiIndo
          </Link>
          <span className="text-sm text-[#444]">Data kabinet</span>
        </div>
      </header>
      <main id="konten" className="container py-12 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#444]">Catatan bersumber</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Data kabinet Indonesia</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#444]">
          Hanya catatan dengan tautan sumber yang ditampilkan. Ketiadaan catatan bukan berarti laporan atau informasi publik tidak ada.
        </p>

        {empty ? (
          <section className="mt-12 max-w-2xl border-t border-[#999] py-8" aria-labelledby="status-data">
            <h2 id="status-data" className="text-2xl font-bold">Belum ada catatan terverifikasi</h2>
            <p className="mt-3 leading-7 text-[#444]">
              Data pejabat, instansi, dan LHKPN belum dimasukkan ke kumpulan data ini. Kami tidak menampilkan nama atau angka tanpa rujukan.
            </p>
            <Link className="mt-5 inline-flex min-h-11 items-center font-medium text-[#a60000] underline underline-offset-4" href="/">
              Kembali ke beranda
            </Link>
          </section>
        ) : (
          <>
            {content.pejabat.length > 0 && (
              <section className="mt-14" aria-labelledby="daftar-pejabat">
                <h2 id="daftar-pejabat" className="mb-6 text-2xl font-bold">Pejabat</h2>
                <ul className="divide-y divide-[#d6d6d6] border-t border-[#999]">
                  {content.pejabat.map((pejabat) => {
                    const instansi = findInstansi(content, pejabat.instansi)!;
                    const reports = content.lhkpn.filter((report) => report.pejabat === pejabat.id);
                    return (
                      <li key={pejabat.id} className="py-7">
                        <h3 className="text-xl font-bold">{pejabat.nama}</h3>
                        <p className="mt-1 text-[#444]">{pejabat.jabatan}, {instansi.nama}</p>
                        {pejabat.mulai && (
                          <p className="mt-1 text-sm text-[#555]">
                            Mulai menjabat: {tanggalFormatter.format(new Date(`${pejabat.mulai}T00:00:00Z`))}
                          </p>
                        )}
                        {pejabat.isi && <div className="mt-3 max-w-3xl space-y-3 leading-7"><Markdown>{pejabat.isi}</Markdown></div>}
                        <a className="mt-3 inline-flex min-h-11 items-center text-[#a60000] underline underline-offset-4" href={pejabat.sumber} target="_blank" rel="noopener noreferrer">Sumber jabatan</a>
                        {reports.length > 0 && (
                          <div className="mt-5">
                            <h4 className="font-semibold">Laporan LHKPN</h4>
                            <ul className="mt-2 space-y-3">
                              {reports.map((report) => (
                                <li key={report.periode}>
                                  <a className="inline-flex min-h-11 items-center text-[#a60000] underline underline-offset-4" href={report.sumber} target="_blank" rel="noopener noreferrer">Periode {report.periode}, lihat sumber</a>
                                  {report.isi && <div className="max-w-3xl space-y-3 leading-7"><Markdown>{report.isi}</Markdown></div>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            {content.instansi.length > 0 && (
              <section className="mt-14" aria-labelledby="daftar-instansi">
                <h2 id="daftar-instansi" className="mb-6 text-2xl font-bold">Instansi</h2>
                <ul className="divide-y divide-[#d6d6d6] border-t border-[#999]">
                  {content.instansi.map((instansi) => (
                    <li key={instansi.id} className="py-6">
                      <h3 className="text-xl font-bold">{instansi.nama}</h3>
                      {instansi.isi && <div className="mt-3 max-w-3xl space-y-3 leading-7"><Markdown>{instansi.isi}</Markdown></div>}
                      <a className="mt-3 inline-flex min-h-11 items-center text-[#a60000] underline underline-offset-4" href={instansi.sumber} target="_blank" rel="noopener noreferrer">Sumber instansi</a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
