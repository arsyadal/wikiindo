"use client";

import Link from "next/link";

export default function KabinetError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container py-20" role="alert">
      <h1 className="text-3xl font-bold">Data kabinet belum dapat ditampilkan</h1>
      <p className="mt-3 max-w-xl leading-7 text-[#444]">Ada catatan yang tidak dapat dibaca. Coba muat ulang atau kembali ke beranda.</p>
      <div className="mt-6 flex flex-wrap gap-5">
        <button className="min-h-11 rounded-sm bg-[#a60000] px-5 font-medium text-white" onClick={reset}>Coba lagi</button>
        <Link className="inline-flex min-h-11 items-center text-[#a60000] underline underline-offset-4" href="/">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
