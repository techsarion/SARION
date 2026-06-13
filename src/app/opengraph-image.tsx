import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

// Site-wide default Open Graph / Twitter card. Placed at the app root so every
// route inherits it unless it exports its own opengraph-image.
// Standalone Node deploy (Coolify/Docker) — not Vercel Edge.
export const runtime = "nodejs";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "white",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Run your entire agency from one place.
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 32,
              fontWeight: 400,
            }}
          >
            Clients, projects, invoices, and client portals — in one workspace.
          </div>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          trysarion.com
        </div>
      </div>
    ),
    { ...size },
  );
}
