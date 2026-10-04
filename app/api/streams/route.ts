import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

const VALID_TYPES = ["movie", "series", "episode"] as const;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const link = params.get("link")?.trim();
  const type = params.get("type")?.trim();
  const providerId = params.get("provider")?.trim();

  if (!link) return NextResponse.json({ error: "Missing link" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json(
      { error: "type must be movie, series or episode" },
      { status: 400 },
    );
  }

  const provider = providerId ? getProvider(providerId) : undefined;

  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found. Use ?provider=<id>." },
      { status: 404 },
    );
  }

  try {
    const streams = await provider.getStreams(
      link,
      type as "movie" | "series" | "episode",
      request.signal,
    );

    return NextResponse.json({
      provider: provider.id,
      streams,
    });
  } catch (error) {
    console.error(`[${provider.id}] streams`, error);
    return NextResponse.json({ error: "Stream resolver failed" }, { status: 502 });
  }
}
