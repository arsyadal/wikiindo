# Changelog

Rangkuman ini ditulis dan dirawat secara manual; perubahan tidak dicatat otomatis di sini. Riwayat Git merekam perubahan kode secara terperinci.

## 2026-09-23

- Proyek dimulai dengan brief desain Red Broadcast di `design.md`.
- Tujuan WikiIndo ditetapkan sebagai basis data publik tentang pemerintahan dengan rujukan yang dapat diperiksa, dengan cakupan awal kabinet Indonesia saat ini.
- Halaman utama memperkenalkan tujuan, pendekatan sumber, cakupan, dan kontribusi. Data pejabat, instansi, dan LHKPN dikelola di direktori konten Markdown terstruktur.
- Proyek menambahkan arsitektur konten berkas Markdown dengan template dan validasi sumber serta relasi, API pemuatan dan pencarian, dan halaman `/kabinet` dengan keadaan kosong, memuat, dan galat.
- Menambahkan data lengkap pejabat dan instansi Kabinet Merah Putih (Presiden, Wakil Presiden, Menteri Koordinator, Menteri Negara, Pejabat Setingkat Menteri, dan Sekretaris Kabinet) bersumber dari Sekretariat Kabinet (`setkab.go.id`).
- Menambahkan tampilan interaktif pada halaman `/kabinet` dengan pencarian cerdas (nama, jabatan, instansi) dan filter kategori berbasis chips/pills sesuai sistem desain Red Broadcast.
- Menambahkan halaman Changelog publik (`/changelog`) dengan tata letak linimasa dan integrasi navigasi di seluruh situs (header desktop, menu mobile, dan footer).
- Repositori menambahkan form GitHub untuk kritik atau saran, koreksi data bersumber, dan laporan bug; beserta panduan kontribusi, pemeriksaan pull request, lisensi MIT, dan kebijakan pelaporan keamanan yang menyatakan saluran privat belum terverifikasi.
