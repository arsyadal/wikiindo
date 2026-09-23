# Menulis data kabinet

Halaman `/kabinet` membaca berkas Markdown saat build. Direktori LHKPN masih kosong karena belum ada laporan dengan rujukan KPK yang dicatat. Perubahan data memerlukan build dan deploy ulang.

Salin berkas dari `templates/`, lalu isi dan simpan sebagai:

```text
instansi/<slug-instansi>.md
pejabat/<slug-pejabat>.md
lhkpn/<slug-pejabat>/<YYYY>.md
```

Nama berkas memakai huruf kecil, angka, dan tanda hubung. Slug adalah ID stabil: `pejabat.instansi` harus sama dengan nama berkas instansi tanpa `.md`; nama direktori LHKPN harus sama dengan nama berkas pejabat tanpa `.md`. Jangan mengganti slug tanpa memperbarui semua rujukannya.

Frontmatter `instansi` wajib memuat `nama` dan `sumber`. Frontmatter `pejabat` wajib memuat `nama`, `jabatan`, `instansi`, dan `sumber`; `mulai` boleh diisi tanggal mulai menjabat berformat `"YYYY-MM-DD"` jika sumber menegaskannya. Hapus baris `mulai` dari template jika tanggal belum terkonfirmasi. Frontmatter LHKPN wajib memuat `periode` berupa tahun empat digit tanpa tanda kutip dan `sumber`; `periode` harus sama dengan tahun pada nama berkas. Isi setelah frontmatter adalah Markdown, yang ditampilkan pada halaman. Tambahkan tautan sumber di dalam isi jika uraian mengutip lebih dari satu dokumen.

`sumber` harus berupa URL HTTP(S) lengkap tanpa kredensial. Validasi program hanya memeriksa bentuk URL, bukan keaslian dokumennya. Periksa sendiri sumber resmi pemerintah untuk nama, jabatan yang masih berlaku, instansi, dan dokumen LHKPN. Jangan isi tahun laporan berdasarkan tahun unggah atau tahun jabatan bila dokumen menyebut periode lain. Jika laporan belum ditemukan, jangan membuat berkas LHKPN. Jangan menyalin placeholder template ke direktori data sebagai catatan.

Jalankan `bun test lib/content/index.test.ts` untuk memeriksa aturan pembacaan, dan `bun run typecheck` untuk memeriksa tipe. Pembaca program dapat memakai `loadContent()` dari `lib/content` untuk memperoleh daftar `pejabat`, `instansi`, dan `lhkpn`, lalu `findPejabat`, `findInstansi`, atau `findLhkpn` untuk mengambil relasi berdasarkan slug dan periode. Kesalahan frontmatter atau referensi yang putus akan menghentikan pembacaan dan menunjukkan jalur berkasnya.
