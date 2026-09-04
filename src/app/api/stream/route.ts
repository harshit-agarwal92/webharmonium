import { NextResponse } from "next/server";
import { searchSaavn } from "@/lib/providers/saavn";
import { searchDeezer } from "@/lib/providers/deezer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const videoId = searchParams.get("id");
  const title = searchParams.get("title") || "";
  const artist = searchParams.get("artist") || "";

  if (!videoId && !title) {
    return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
  }

  const query = `${title} ${artist}`.trim();

  if (query) {
    // 1. Try JioSaavn
    try {
      const saavnResults = await searchSaavn(query);
      if (saavnResults.length > 0) {
        const track = saavnResults[0];
        if (track.url) {
          return NextResponse.json({
            url: track.url,
            source: "saavn",
          });
        }
      }
    } catch (e) {
      console.error("[StreamRoute] Saavn resolution failed:", e);
    }

    // 2. Fallback to Deezer Preview
    try {
      const deezerResults = await searchDeezer(query);
      if (deezerResults.length > 0) {
        const track = deezerResults[0];
        if (track.preview) {
          return NextResponse.json({
            url: track.preview,
            source: "deezer",
          });
        }
      }
    } catch (e) {
      console.error("[StreamRoute] Deezer resolution failed:", e);
    }
  }

  // Return 404 if both fail (No YouTube fallback)
  return NextResponse.json({ error: "Could not resolve playable audio stream" }, { status: 404 });
}
