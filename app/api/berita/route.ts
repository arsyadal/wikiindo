import { NextRequest, NextResponse } from "next/server";
import { clearNewsCache, fetchAllNews, NewsCategory } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") as NewsCategory) || undefined;
    const sourceId = searchParams.get("source") || undefined;
    const search = searchParams.get("q") || undefined;
    const refresh = searchParams.get("refresh") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (refresh) {
      clearNewsCache();
    }

    const feed = await fetchAllNews({
      category: category && category !== "Semua" ? category : undefined,
      sourceId,
      search,
      limit,
    });

    return NextResponse.json(feed, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Gagal memuat feed berita",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
