import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HavenHatchr",
    short_name: "HavenHatchr",
    description:
      "Breeder software for flocks, birds, hatch groups, reservations, genetics, and customer tracking.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f5f4fb",
    theme_color: "#f5f4fb",
    icons: [
      {
        src: "/next.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
