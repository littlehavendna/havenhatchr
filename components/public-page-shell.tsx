import { ReactNode } from "react";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { PublicSiteNav } from "@/components/public-site-nav";

type PublicPageShellProps = {
  children: ReactNode;
};

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <PublicSiteNav />
      <main>{children}</main>
      <PublicSiteFooter />
    </div>
  );
}
