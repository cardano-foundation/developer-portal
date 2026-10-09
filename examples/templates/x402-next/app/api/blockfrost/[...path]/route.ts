/**
 * Server-side Blockfrost proxy for the paywall. The browser calls
 * /api/blockfrost/<path>; this route adds the project ID, which never leaves
 * the server.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = "https://cardano-preprod.blockfrost.io/api/v0";

// Only the calls the paywall makes: protocol parameters for building the
// payment, and a wallet address's UTxOs for the preprod check. Anything else
// is refused, so the route cannot spend your quota on other queries.
const ALLOWED_PATHS = [/^epochs\/latest\/parameters$/, /^addresses\/addr_test1[0-9a-z]+\/utxos$/];

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!ALLOWED_PATHS.some(pattern => pattern.test(path))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId?.startsWith("preprod")) {
    return NextResponse.json({ error: "Set BLOCKFROST_PROJECT_ID to a preprod project ID." }, { status: 500 });
  }

  // Forward only the paging parameters the UTxO query uses.
  const query = new URLSearchParams();
  for (const key of ["page", "count"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value && /^\d{1,3}$/.test(value)) query.set(key, value);
  }

  try {
    const upstream = await fetch(`${BASE_URL}/${path}${query.size ? `?${query}` : ""}`, {
      headers: { project_id: projectId },
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Blockfrost is unreachable." }, { status: 502 });
  }
}
