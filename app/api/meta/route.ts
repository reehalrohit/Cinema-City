import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim();
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

  let provider;

  if (providerId) {
    provider = getProvider(providerId);
  }

  /*
   * If provider isn't explicitly supplied, try the
   * provider encoded into the ID.
   *
   * Example:
   * vega:abc123
   */
  if (!provider) {
    const separator = id.indexOf(":");

    if (separator > 0) {
      const extractedProvider =
        id.substring(0, separator);

      provider = getProvider(extractedProvider);
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
    const meta = await provider.getMeta(
      id,
      request.signal
    );

    return NextResponse.json(meta, {
      headers: {
        "Cache-Control":
          "public, s-maxage=600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error(
      `[meta] ${provider.id}`,
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch metadata",
      },
      { status: 502 }
    );
  }
}
