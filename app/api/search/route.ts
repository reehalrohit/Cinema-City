import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1,
  );

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  if (query.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    getProviders().map((provider) =>
      provider.search(query, page, request.signal),
    ),
  );

  const items = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  const unique = new Map<string, (typeof items)[number]>();

  for (const item of items) {
    const key = `${item.provider}:${item.id}`;
    if (!unique.has(key)) unique.set(key, item);
  }

  return NextResponse.json(Array.from(unique.values()));
}
