import type { ReactNode } from "react";

import PublicFooter from "./PublicFooter";
import PublicNavbar from "./PublicNavbar";
import PublicScrollProgress from "./PublicScrollProgress";
import PublicScrollToTop from "./PublicScrollToTop";

type PublicLayoutProps = {
  children: ReactNode;
  showFooter?: boolean;
};

export default function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  return (
    <div className="public-site min-h-screen public-theme-bg text-slate-950 transition-colors duration-500 dark:text-white">
      <PublicScrollProgress />
      <PublicNavbar />
      <main className="relative z-0 min-w-0 pt-[72px] md:pt-[80px] lg:pt-[86px]">{children}</main>
      {showFooter ? <PublicFooter /> : null}
      <PublicScrollToTop />
    </div>
  );
}
