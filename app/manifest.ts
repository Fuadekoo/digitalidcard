import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export const revalidate = false;

// 👇 This disables i18n prefixing for this route
export const dynamicParams = false;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "East shoa",
    short_name: "East shoa",
    description:
      "A comprehensive ID card management system for citizens, stations, and administrators",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    protocol_handlers: [{ protocol: "web+menu", url: "/s%" }],
    display_override: ["standalone", "window-controls-overlay"],

    icons: [
      {
        src: "/oromia.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/oromia.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
