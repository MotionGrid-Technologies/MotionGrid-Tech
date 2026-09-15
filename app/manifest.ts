import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#08090a",
    theme_color: "#08090a",
    icons: [
      { src: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/brand/logo-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
