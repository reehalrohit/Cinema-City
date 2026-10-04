import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim();

  const seasonParam =
    request.nextUrl.searchParams.get("season");

  const providerId =
    request.nextUrl.searchParams.get("provider")?.trim();

  if (!id) {
    return NextResponse.json(
      {
        error: "Missing id",
      },
      { status: 400 }
    );
  }

  const season = Number.parseInt(
    seasonParam || "1",
    10
  );

  if (!Number.isInteger(season) || season < 1) {
    return NextResponse.json(
      {
        error: "Invalid season",
      },
      { status: 400 }
    );
  }

  let provider;

  if (providerId) {
    provider = getProvider(providerId);
  }

  if (!provider) {
    const separator = id.indexOf(":");

    if (separator > 0) {
      provider = getProvider(
        id.substring(0, separator)
      );
    }
  }

  if (!provider) {
    return NextResponse.json(
      {
        error: "Provider not found",
      },
      { status: 404 }
    );
  }

  if (!provider.getEpisodes) {
    return NextResponse.json(
      {
        error:
          `Provider "${provider.id}" does not support episodes`,
      },
      { status: 400 }
    );
  }

  try {
    const episodes =
      await provider.getEpisodes(
        id,
        season,
        request.signal
      );

    return NextResponse.json(episodes, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch (error) {
    console.error(
      `[episodes] ${provider.id}`,
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch episodes",
      },
      { status: 502 }
    );
  }
}
