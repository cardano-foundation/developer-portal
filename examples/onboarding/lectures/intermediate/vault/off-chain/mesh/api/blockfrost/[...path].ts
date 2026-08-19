// #region file
/// The same rule as `vite.config.ts`, for hosts that serve the built page as
/// static files. Vercel has no Vite process, so `/api/blockfrost/...` needs a
/// function. Set BLOCKFROST_API_KEY in the project's environment variables.
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const key = process.env.BLOCKFROST_API_KEY ?? "";
  const { pathname, search } = new URL(req.url);
  const path = pathname.replace(/^\/api\/blockfrost/, "") + search;

  return fetch(`https://cardano-${key.slice(0, 7)}.blockfrost.io/api/v0${path}`, {
    method: req.method,
    headers: { project_id: key, "content-type": "application/json" },
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.text(),
  });
}
// #endregion file
