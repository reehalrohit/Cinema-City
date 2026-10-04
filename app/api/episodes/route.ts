import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const params =
    request.nextUrl.searchParams;

  const id =
    params.get("id")?.trim();

  const season =
    Number.parseInt(
      params.get("season") || "1",
      10,
    );

  const providerId =
    params.get("provider")?.trim();

  if (!id) {
    return NextResponse.json(
      {
        error: "Missing id",
      },
      { status: 400 },
    );
  }

  if (
    !Number.isInteger(season) ||
    season < 1
  ) {
    return NextResponse.json(
      {
        error: "Invalid season",
      },
      { status: 400 },
    );
  }

  let provider;

  if (providerId) {
    provider =
      getProvider(providerId);
  }

  if (!provider) {
    const separator =
      id.indexOf(":");

    if (separator > 0) {
      provider =
        getProvider(
          id.slice(0, separator),
        );
    }
  }

  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Provider not found",
      },
      { status: 404 },
    );
  }

  if (!provider.getEpisodes) {
    return NextResponse.json(
      {
        error:
          "Provider does not support episodes",
      },
      { status: 400 },
    );
  }

  try {
    const episodes =
      await provider.getEpisodes(
        id,
        season,
        request.signal,
      );

    return NextResponse.json(
      episodes,
    );
  } catch (error) {
    console.error(
      `[${provider.id}] episodes`,
      error,
    );

    return NextResponse.json(
      {
        error:
          "Episode provider failed",
      },
      { status: 502 },
    );
  }
}
