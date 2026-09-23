"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#data", label: "Data" },
  { href: "#sumber", label: "Sumber" },
  { href: "#kebutuhan", label: "Kebutuhan & Donasi" },
  { href: "#komunitas", label: "Terbuka untuk umum" },
];

export function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="mobile-menu-trigger" aria-label="Buka menu navigasi">
          <Menu size={18} aria-hidden="true" />
          Menu
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-dialog-overlay" />
        <Dialog.Content className="mobile-dialog">
          <div className="mobile-dialog-head">
            <Dialog.Title className="mobile-dialog-title">Navigasi</Dialog.Title>
            <Dialog.Close asChild>
              <button className="mobile-dialog-close" aria-label="Tutup menu navigasi">
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="mobile-dialog-nav" aria-label="Navigasi utama">
            {links.map((link) => (
              <Dialog.Close asChild key={link.href}>
                <a href={link.href}>{link.label}</a>
              </Dialog.Close>
            ))}
            <Dialog.Close asChild>
              <a className={buttonVariants({ variant: "red" })} href="#data">
                Lihat fokus data
              </a>
            </Dialog.Close>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
