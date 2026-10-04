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

  let provider;

  if (providerId) {
    provider =
      getProvider(providerId);
  }

  /*
   * Supports:
   *
   * ?id=vega:https://...
   */
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

  try {
    const meta =
      await provider.getMeta(
        id,
        request.signal,
      );

    return NextResponse.json(meta);
  } catch (error) {
    console.error(
      `[${provider.id}] meta`,
      error,
    );

    return NextResponse.json(
      {
        error:
          "Metadata provider failed",
      },
      { status: 502 },
    );
  }
}
