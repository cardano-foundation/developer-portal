// #region file
/// The same rule as `vite.config.ts`, for hosts that serve the built page as
/// static files. Vercel has no Vite process, so `/api/blockfrost/...` needs a
/// function. The rewrite in `vercel.json` sends every one of those calls here,
/// with the rest of the path in the `path` query parameter.
export default {
  async fetch(req: Request): Promise<Response> {
    const key = process.env.BLOCKFROST_API_KEY ?? "";
    const url = new URL(req.url);
    const path = url.searchParams.get("path") ?? "";
    url.searchParams.delete("path");

    const response = await fetch(`https://cardano-${key.slice(0, 7)}.blockfrost.io/api/v0/${path}${url.search}`, {
      method: req.method,
      headers: {
        project_id: key,
        // A submitted transaction is bytes, with a content type of its own.
        "content-type": req.headers.get("content-type") ?? "application/json",
      },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    });

    return new Response(response.body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  },
};
// #endregion file
