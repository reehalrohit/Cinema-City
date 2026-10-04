import { NextResponse } from "next/server";
import { getProviders } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const providers = getProviders();

  if (providers.length === 0) {
    return NextResponse.json([]);
  }

  const signal = request.signal;

  const results = await Promise.allSettled(
    providers
      .filter((provider) => provider.getCatalog)
      .map((provider) => provider.getCatalog!(signal))
  );

  const sections = results.flatMap((result) => {
    if (result.status !== "fulfilled") {
      return [];
    }

    return result.value;
  });

  return NextResponse.json(sections, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
