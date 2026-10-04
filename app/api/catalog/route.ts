import { NextResponse } from "next/server";
import { getProviders } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const results = await Promise.allSettled(
    getProviders()
      .filter((provider) => provider.getCatalog)
      .map((provider) => provider.getCatalog!(request.signal)),
  );

  const sections = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return NextResponse.json(sections);
}
