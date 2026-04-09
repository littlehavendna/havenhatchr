import type { MetadataRoute } from "next";
import { getAppOrigin } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const origin = getAppOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/customers",
          "/flocks",
          "/birds",
          "/chicks",
          "/pairings",
          "/hatch-groups",
          "/reservations",
          "/orders",
          "/analytics",
          "/traits",
          "/genetics",
          "/ai",
          "/settings",
          "/login",
          "/signup",
          "/api/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

