import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  const pageParam =
    request.nextUrl.searchParams.get("page");

  const page = Math.max(
    1,
    Number.parseInt(pageParam || "1", 10) || 1
  );

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing search query",
      },
      { status: 400 }
    );
  }

  if (query.length > 100) {
    return NextResponse.json(
      {
        error: "Search query is too long",
      },
      { status: 400 }
    );
  }

  const providers = getProviders();

  if (providers.length === 0) {
    return NextResponse.json([]);
  }

  const results = await Promise.allSettled(
    providers.map((provider) =>
      provider.search(
        query,
        page,
        request.signal
      )
    )
  );

  const movies = results.flatMap((result) => {
    if (result.status !== "fulfilled") {
      return [];
    }

    return result.value;
  });

  // Remove duplicate items.
  const unique = new Map<string, (typeof movies)[number]>();

  for (const movie of movies) {
    const key =
      `${movie.provider}:${movie.id}`.toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, movie);
    }
  }

  return NextResponse.json(
    Array.from(unique.values()),
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
