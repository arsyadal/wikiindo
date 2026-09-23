import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "harus berupa slug huruf kecil");
const source = z.string().url().refine((value) => {
  const url = new URL(value);
  return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
}, "harus URL sumber HTTP(S) tanpa kredensial");
const text = z.string().trim().min(1);
const pejabatSchema = z.strictObject({ nama: text, jabatan: text, instansi: slug, mulai: z.iso.date().optional(), sumber: source });
const instansiSchema = z.strictObject({ nama: text, sumber: source });
const lhkpnSchema = z.strictObject({ periode: z.number().int().min(1000).max(9999), sumber: source });

type PejabatFields = z.infer<typeof pejabatSchema>;
type InstansiFields = z.infer<typeof instansiSchema>;
type LhkpnFields = z.infer<typeof lhkpnSchema>;

export type Pejabat = PejabatFields & { id: string; isi: string };
export type Instansi = InstansiFields & { id: string; isi: string };
export type Lhkpn = LhkpnFields & { pejabat: string; isi: string };
export type Content = { pejabat: Pejabat[]; instansi: Instansi[]; lhkpn: Lhkpn[] };

async function entries(directory: string) {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function parse<T extends z.ZodType>(root: string, filename: string, schema: T) {
  const relative = path.relative(root, filename).split(path.sep).join("/");
  try {
    const { data, content } = matter(await readFile(filename, "utf8"));
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`);
      throw new Error(errors.join("; "));
    }
    return { fields: result.data as z.infer<T>, isi: content.trim() };
  } catch (error) {
    throw new Error(`${relative}: ${(error as Error).message}`, { cause: error });
  }
}

export async function loadContent(root = path.join(process.cwd(), "content")): Promise<Content> {
  const content: Content = { pejabat: [], instansi: [], lhkpn: [] };

  for (const entry of await entries(path.join(root, "instansi"))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const id = path.basename(entry.name, ".md");
    slug.parse(id);
    const { fields, isi } = await parse(root, path.join(root, "instansi", entry.name), instansiSchema);
    content.instansi.push({ id, ...fields, isi });
  }

  const instansiIds = new Set(content.instansi.map(({ id }) => id));
  for (const entry of await entries(path.join(root, "pejabat"))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const id = path.basename(entry.name, ".md");
    slug.parse(id);
    const { fields, isi } = await parse(root, path.join(root, "pejabat", entry.name), pejabatSchema);
    if (!instansiIds.has(fields.instansi)) {
      throw new Error(`pejabat/${entry.name}: instansi ${fields.instansi} tidak ditemukan`);
    }
    content.pejabat.push({ id, ...fields, isi });
  }

  const pejabatIds = new Set(content.pejabat.map(({ id }) => id));
  for (const person of await entries(path.join(root, "lhkpn"))) {
    if (!person.isDirectory()) continue;
    const directory = path.join(root, "lhkpn", person.name);
    for (const report of await entries(directory)) {
      if (!report.isFile() || !report.name.endsWith(".md")) continue;
      const filename = path.join(directory, report.name);
      const year = path.basename(report.name, ".md");
      if (!/^\d{4}$/.test(year)) throw new Error(`lhkpn/${person.name}/${report.name}: nama berkas harus YYYY.md`);
      const { fields, isi } = await parse(root, filename, lhkpnSchema);
      if (fields.periode !== Number(year)) {
        throw new Error(`lhkpn/${person.name}/${report.name}: periode harus ${year}`);
      }
      if (!pejabatIds.has(person.name)) {
        throw new Error(`lhkpn/${person.name}/${report.name}: pejabat ${person.name} tidak ditemukan`);
      }
      content.lhkpn.push({ pejabat: person.name, ...fields, isi });
    }
  }

  content.pejabat.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  content.instansi.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  content.lhkpn.sort((a, b) => a.pejabat.localeCompare(b.pejabat) || b.periode - a.periode);
  return content;
}

export function findPejabat(content: Content, id: string): Pejabat | undefined {
  return content.pejabat.find((record) => record.id === id);
}

export function findInstansi(content: Content, id: string): Instansi | undefined {
  return content.instansi.find((record) => record.id === id);
}

export function findLhkpn(content: Content, pejabat: string, periode: number): Lhkpn | undefined {
  return content.lhkpn.find((record) => record.pejabat === pejabat && record.periode === periode);
}
