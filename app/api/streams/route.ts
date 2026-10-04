import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

const allowedTypes = [
  "movie",
  "series",
  "episode",
] as const;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const link = params.get("link")?.trim();
  const type = params.get("type")?.trim();
  const providerId = params.get("provider")?.trim();

  if (!link) {
    return NextResponse.json(
      {
        error: "Missing link",
      },
      { status: 400 }
    );
  }

  if (!type) {
    return NextResponse.json(
      {
        error: "Missing type",
      },
      { status: 400 }
    );
  }

  if (
    !allowedTypes.includes(
      type as (typeof allowedTypes)[number]
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid type. Use movie, series or episode.",
      },
      { status: 400 }
    );
  }

  let provider;

  if (providerId) {
    provider = getProvider(providerId);
  }

  /*
   * Optional format:
   *
   * link=vega:https://example.com/video
   *
   * This allows the API to determine the provider.
   */
  if (!provider) {
    const separator = link.indexOf(":");

    if (separator > 0) {
      const possibleProvider =
        link.substring(0, separator);

      const found =
        getProvider(possibleProvider);

      if (found) {
        provider = found;
      }
    }
  }

  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Provider not found. Use ?provider=<provider-id>.",
      },
      { status: 404 }
    );
  }

  try {
    const streams =
      await provider.getStreams(
        link,
        type as "movie" | "series" | "episode",
        request.signal
      );

    return NextResponse.json(
      {
        provider: provider.id,
        streams,
      },
      {
        headers: {
          "Cache-Control":
            "private, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error(
      `[streams] ${provider.id}`,
      error
    );

    return NextResponse.json(
      {
        error: "Failed to resolve streams",
      },
      { status: 502 }
    );
  }
}
