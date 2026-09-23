"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink, Building2, User, X } from "lucide-react";
import type { Content, Instansi, Pejabat } from "@/lib/content";

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" });

type Category = "Semua" | "Pimpinan Eksekutif" | "Menteri Koordinator" | "Menteri" | "Pejabat Setingkat Menteri" | "Sekretariat Kabinet" | "Instansi";

const CATEGORIES: Category[] = [
  "Semua",
  "Pimpinan Eksekutif",
  "Menteri Koordinator",
  "Menteri",
  "Pejabat Setingkat Menteri",
  "Sekretariat Kabinet",
  "Instansi",
];

function getCategory(pejabat: Pejabat): Category {
  const jab = pejabat.jabatan.toLowerCase();
  if (jab.includes("presiden") && !jab.includes("staf") && !jab.includes("kantor")) {
    return "Pimpinan Eksekutif";
  }
  if (jab.includes("menteri koordinator")) {
    return "Menteri Koordinator";
  }
  if (jab.startsWith("menteri")) {
    return "Menteri";
  }
  if (jab.includes("sekretaris kabinet")) {
    return "Sekretariat Kabinet";
  }
  return "Pejabat Setingkat Menteri";
}

interface KabinetViewProps {
  content: Content;
}

export function KabinetView({ content }: KabinetViewProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Semua");

  const instansiMap = useMemo(() => {
    const map = new Map<string, Instansi>();
    for (const inst of content.instansi) {
      map.set(inst.id, inst);
    }
    return map;
  }, [content.instansi]);

  const filteredPejabat = useMemo(() => {
    if (selectedCategory === "Instansi") return [];

    const q = query.trim().toLowerCase();
    return content.pejabat.filter((p) => {
      const category = getCategory(p);
      if (selectedCategory !== "Semua" && category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      const instansi = instansiMap.get(p.instansi);
      const matchName = p.nama.toLowerCase().includes(q);
      const matchJabatan = p.jabatan.toLowerCase().includes(q);
      const matchInstansi = instansi ? instansi.nama.toLowerCase().includes(q) : false;

      return matchName || matchJabatan || matchInstansi;
    });
  }, [content.pejabat, query, selectedCategory, instansiMap]);

  const filteredInstansi = useMemo(() => {
    if (selectedCategory !== "Semua" && selectedCategory !== "Instansi") return [];

    const q = query.trim().toLowerCase();
    return content.instansi.filter((inst) => {
      if (!q) return true;
      return inst.nama.toLowerCase().includes(q) || inst.id.toLowerCase().includes(q);
    });
  }, [content.instansi, query, selectedCategory]);

  const totalResults = filteredPejabat.length + (selectedCategory === "Semua" || selectedCategory === "Instansi" ? filteredInstansi.length : 0);

  return (
    <div className="mt-8">
      {/* Search Bar & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#606060]">
            <Search size={18} aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pejabat, jabatan, atau instansi..."
            className="w-full h-11 pl-10 pr-10 bg-[#f2f2f2] border border-transparent rounded-full text-sm text-[#0f0f0f] placeholder-[#606060] focus:bg-white focus:border-[#0f0f0f] focus:outline-none transition-colors"
            aria-label="Cari data kabinet"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#606060] hover:text-[#0f0f0f]"
              aria-label="Hapus pencarian"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="text-sm text-[#606060] flex items-center gap-2">
          <span>{content.pejabat.length} Pejabat</span>
          <span>•</span>
          <span>{content.instansi.length} Instansi</span>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter kategori kabinet">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-[#0f0f0f] text-white"
                  : "bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results Count & Query Notice */}
      {query && (
        <div className="mt-4 flex items-center justify-between text-sm text-[#606060]">
          <p>
            Menampilkan hasil untuk &quot;<span className="font-medium text-[#0f0f0f]">{query}</span>&quot;
          </p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("Semua");
            }}
            className="text-[#a60000] hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="mt-12 py-16 text-center border border-dashed border-[#d6d6d6] rounded-xl">
          <p className="text-lg font-medium text-[#0f0f0f]">Tidak ada catatan yang cocok</p>
          <p className="mt-1 text-sm text-[#606060]">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("Semua");
            }}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#a60000] underline underline-offset-4"
          >
            Hapus filter pencarian
          </button>
        </div>
      )}

      {/* Officials List */}
      {filteredPejabat.length > 0 && (
        <section className="mt-10" aria-labelledby="heading-pejabat">
          <div className="flex items-center justify-between mb-4">
            <h2 id="heading-pejabat" className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-[#a60000]" aria-hidden="true" />
              Pejabat ({filteredPejabat.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPejabat.map((pejabat) => {
              const instansi = instansiMap.get(pejabat.instansi);
              const category = getCategory(pejabat);
              const reports = content.lhkpn.filter((r) => r.pejabat === pejabat.id);

              return (
                <article
                  key={pejabat.id}
                  className="p-5 border border-[#e5e5e5] rounded-xl bg-white hover:border-[#b0b0b0] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#f2f2f2] text-[#444]">
                        {category}
                      </span>
                      {pejabat.mulai && (
                        <span className="text-xs text-[#606060]">
                          Mulai: {tanggalFormatter.format(new Date(`${pejabat.mulai}T00:00:00Z`))}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[#0f0f0f] leading-snug">{pejabat.nama}</h3>
                    <p className="mt-1 text-sm font-medium text-[#a60000]">{pejabat.jabatan}</p>
                    <p className="mt-1 text-xs text-[#606060] flex items-center gap-1.5">
                      <Building2 size={13} className="shrink-0" aria-hidden="true" />
                      <span>{instansi ? instansi.nama : pejabat.instansi}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f2f2f2] flex items-center justify-between text-xs">
                    <a
                      href={pejabat.sumber}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#065fd4] hover:underline"
                    >
                      <span>Sumber data</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                    {reports.length > 0 ? (
                      <span className="text-[#2ba640] font-medium">{reports.length} LHKPN</span>
                    ) : (
                      <span className="text-[#999]">LHKPN belum tercatat</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Institutions List */}
      {filteredInstansi.length > 0 && (
        <section className="mt-14" aria-labelledby="heading-instansi">
          <div className="flex items-center justify-between mb-4">
            <h2 id="heading-instansi" className="text-xl font-bold flex items-center gap-2">
              <Building2 size={20} className="text-[#a60000]" aria-hidden="true" />
              Kementerian &amp; Lembaga ({filteredInstansi.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredInstansi.map((instansi) => (
              <div
                key={instansi.id}
                className="p-4 border border-[#e5e5e5] rounded-lg bg-white hover:border-[#b0b0b0] transition-colors flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-sm text-[#0f0f0f] leading-snug">{instansi.nama}</h3>
                  <p className="mt-1 text-xs text-[#606060] font-mono">{instansi.id}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#f2f2f2]">
                  <a
                    href={instansi.sumber}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#065fd4] hover:underline"
                  >
                    <span>Sumber instansi</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
