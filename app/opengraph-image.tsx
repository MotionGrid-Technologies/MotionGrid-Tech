import { ImageResponse } from "next/og";

// Metadata for the generated image (served at /opengraph-image).
export const alt = "MotionGrid Technologies — Precision-built software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Legacy UA so Google Fonts serves TTF (ImageResponse only supports
// ttf/otf/woff). Failures fall back to system fonts — never crash the route.
async function loadGoogleFont(
  family: string,
  weight: number,
  style: "normal" | "italic",
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${
        style === "italic" ? 1 : 0
      },${weight}&display=swap&text=${encodeURIComponent(text)}`,
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
        },
      }
    ).then((res) => res.text());

    const src = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!src) return null;
    const data = await fetch(src).then((res) => res.arrayBuffer());
    return data;
  } catch (error) {
    console.error("[opengraph] font load failed", error);
    return null;
  }
}

/** Generates the site's branded Open Graph image. */
export default async function Image() {
  const headline = "MotionGrid Technologies";
  const tagline = "Precision-built software";
  const eyebrow = "MOTIONGRID TECHNOLOGIES";

  const [fraunces, inter] = await Promise.all([
    loadGoogleFont("Fraunces", 500, "italic", headline + "."),
    loadGoogleFont("Inter", 400, "normal", eyebrow + tagline + "motiongrid.co.za"),
  ]);

  const displayFont = fraunces
    ? { name: "Fraunces", data: fraunces, weight: 500 as const, style: "italic" as const }
    : null;
  const sansFont = inter
    ? { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const }
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 84px 72px",
          background: "#08090a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Brushed-metal glow, mirroring the .mg-brushed site texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 18% 0%, rgba(242,118,29,0.14), transparent 62%)," +
              "radial-gradient(ellipse 80% 60% at 100% 8%, rgba(244,245,246,0.06), transparent 55%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "34px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#f2761d",
              }}
            />
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 20,
                letterSpacing: "0.32em",
                color: "#8a8e96",
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontSize: 92,
                lineHeight: 1.04,
                color: "#f4f5f6",
              }}
            >
              {headline}
              <span style={{ color: "#f2761d", marginLeft: "6px" }}>.</span>
            </div>
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 30,
                letterSpacing: "0.06em",
                color: "#b9bcc3",
              }}
            >
              {tagline}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 24,
              letterSpacing: "0.04em",
              color: "#55585f",
            }}
          >
            motiongrid.co.za
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === 3 ? "#f2761d" : "#2a2c31",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [displayFont, sansFont].filter((f): f is NonNullable<typeof f> => f !== null),
    }
  );
}
