// IndexNow integration — notifies search engines (Bing, Yandex, Yep, Seznam,
// Naver) the moment our content changes. Google doesn't support IndexNow yet
// (announced "evaluating" in 2021), so submitting the sitemap to Search
// Console remains the way to reach Google.
//
// The key file is served from /public/<key>.txt with the key itself as
// content — search engines fetch it to verify we control the host.
//
// Spec: https://www.indexnow.org/documentation

import { site } from "./site";

/** 32-hex-char key — must match the filename in /public/<key>.txt. */
export const INDEXNOW_KEY = "b6c7991c983eeddfaa4cbf51d26f61eb";

/** Host used for IndexNow (must match the URLs we submit). */
export const INDEXNOW_HOST = new URL(site.url).hostname;

/** Public location of the key verification file. */
export const INDEXNOW_KEY_LOCATION = `${site.url}/${INDEXNOW_KEY}.txt`;

/** Submit a batch of URLs to IndexNow (max 10000 per call). */
export async function pingIndexNow(
  urls: string[],
): Promise<{ ok: boolean; status: number; message: string }> {
  if (urls.length === 0) return { ok: true, status: 200, message: "no URLs to submit" };

  const body = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls.slice(0, 10000),
  };

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    return {
      ok: res.ok || res.status === 202,
      status: res.status,
      message: indexNowMessage(res.status),
    };
  } catch (e) {
    return { ok: false, status: 0, message: `Network error: ${(e as Error).message}` };
  }
}

function indexNowMessage(status: number): string {
  switch (status) {
    case 200:
      return "OK — URLs submitted";
    case 202:
      return "Accepted — URLs in queue for processing";
    case 400:
      return "Bad request (malformed payload)";
    case 403:
      return "Forbidden (key not valid or key file not reachable)";
    case 422:
      return "Unprocessable (some URLs don't belong to declared host)";
    case 429:
      return "Too many requests — back off";
    default:
      return `Unexpected status ${status}`;
  }
}
