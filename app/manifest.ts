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
      { src: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { src: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-256.png", sizes: "256x256", type: "image/png" },
    ],
  };
}
