"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <div className="lg:hidden">
          <Navbar />
        </div>
        <div className="flex-1 pt-24 lg:pt-0">{children}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 pt-24 md:pt-32">{children}</div>
      <Footer />
    </>
  );
}
