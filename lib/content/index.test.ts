import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { findInstansi, findLhkpn, findPejabat, loadContent } from "./index";

const roots: string[] = [];

async function root() {
  const directory = await mkdtemp(path.join(tmpdir(), "wikiindo-content-"));
  roots.push(directory);
  return directory;
}

async function record(directory: string, relativePath: string, contents: string) {
  const filename = path.join(directory, relativePath);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, contents);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("an empty content tree yields an empty searchable dataset", async () => {
  const content = await loadContent(await root());
  expect(content).toEqual({ pejabat: [], instansi: [], lhkpn: [] });
  expect(findPejabat(content, "tidak-ada")).toBeUndefined();
});

test("loads records and resolves stable filename relationships", async () => {
  const directory = await root();
  await record(directory, "instansi/kementerian-uji.md", "---\nnama: Kementerian Uji\nsumber: https://example.org/instansi\n---\nUraian instansi.\n");
  await record(directory, "pejabat/pejabat-uji.md", "---\nnama: Pejabat Uji\njabatan: Menteri Uji\ninstansi: kementerian-uji\nsumber: https://example.org/pejabat\n---\nUraian pejabat.\n");
  await record(directory, "lhkpn/pejabat-uji/2024.md", "---\nperiode: 2024\nsumber: https://example.org/lhkpn\n---\nUraian laporan.\n");

  const content = await loadContent(directory);
  expect(findPejabat(content, "pejabat-uji")).toMatchObject({
    id: "pejabat-uji", nama: "Pejabat Uji", instansi: "kementerian-uji", isi: "Uraian pejabat.",
  });
  expect(findInstansi(content, "kementerian-uji")?.nama).toBe("Kementerian Uji");
  expect(findLhkpn(content, "pejabat-uji", 2024)).toMatchObject({ pejabat: "pejabat-uji", periode: 2024, isi: "Uraian laporan." });
});

test("rejects invalid source URLs rather than publishing unverified records", async () => {
  const directory = await root();
  await record(directory, "instansi/uji.md", "---\nnama: Instansi Uji\nsumber: javascript:alert(1)\n---\n");
  expect(loadContent(directory)).rejects.toThrow(/instansi\/uji\.md.*sumber/);
});

test("rejects reports whose declared period differs from filename", async () => {
  const directory = await root();
  await record(directory, "lhkpn/pejabat-uji/2024.md", "---\nperiode: 2023\nsumber: https://example.org/lhkpn\n---\n");
  expect(loadContent(directory)).rejects.toThrow(/2024\.md.*periode/);
});

test("rejects broken official-to-institution references", async () => {
  const directory = await root();
  await record(directory, "pejabat/pejabat-uji.md", "---\nnama: Pejabat Uji\njabatan: Menteri Uji\ninstansi: instansi-tidak-ada\nsumber: https://example.org/pejabat\n---\n");
  expect(loadContent(directory)).rejects.toThrow(/pejabat\/pejabat-uji\.md.*instansi-tidak-ada/);
});

test("rejects reports without their corresponding official", async () => {
  const directory = await root();
  await record(directory, "lhkpn/pejabat-uji/2024.md", "---\nperiode: 2024\nsumber: https://example.org/lhkpn\n---\n");
  expect(loadContent(directory)).rejects.toThrow(/lhkpn\/pejabat-uji\/2024\.md.*pejabat-uji/);
});

test("preserves an official's sourced start date", async () => {
  const directory = await root();
  await record(directory, "instansi/instansi-uji.md", "---\nnama: Instansi Uji\nsumber: https://example.org/instansi\n---\n");
  await record(directory, "pejabat/pejabat-uji.md", "---\nnama: Pejabat Uji\njabatan: Menteri Uji\ninstansi: instansi-uji\nmulai: '2025-09-08'\nsumber: https://example.org/pejabat\n---\n");
  expect(findPejabat(await loadContent(directory), "pejabat-uji")?.mulai).toBe("2025-09-08");
});

test("rejects impossible start dates rather than publishing them", async () => {
  const directory = await root();
  await record(directory, "instansi/instansi-uji.md", "---\nnama: Instansi Uji\nsumber: https://example.org/instansi\n---\n");
  await record(directory, "pejabat/pejabat-uji.md", "---\nnama: Pejabat Uji\njabatan: Menteri Uji\ninstansi: instansi-uji\nmulai: '2025-02-30'\nsumber: https://example.org/pejabat\n---\n");
  expect(loadContent(directory)).rejects.toThrow(/pejabat\/pejabat-uji\.md.*mulai/);
});
