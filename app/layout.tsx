import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WikiIndo | Buat Indonesia Lebih Transparan",
  description:
    "WikiIndo dirancang sebagai basis data publik dengan fokus awal pada kabinet Indonesia saat ini; informasi pejabat dan LHKPN akan disusun dengan rujukan sumber.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
