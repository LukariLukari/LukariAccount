import type { Metadata } from "next";
import { Outfit, Syne, Montserrat } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { getBaseUrl } from "@/lib/storefront";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "LukariAccount | Tài khoản và phần mềm bản quyền",
    template: "%s",
  },
  description: "LukariAccount cung cấp tài khoản và phần mềm bản quyền với chính sách hỗ trợ rõ ràng.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LukariAccount | Tài khoản và phần mềm bản quyền",
    description: "LukariAccount cung cấp tài khoản và phần mềm bản quyền với chính sách hỗ trợ rõ ràng.",
    url: "/",
    siteName: "LukariAccount",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LukariAccount | Tài khoản và phần mềm bản quyền",
    description: "LukariAccount cung cấp tài khoản và phần mềm bản quyền với chính sách hỗ trợ rõ ràng.",
  },
};

import AuthContext from "@/providers/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${outfit.variable} ${syne.variable} ${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground" suppressHydrationWarning>
        <AuthContext>
          <CartProvider>
            <Navbar />
            <div className="pt-32 flex-1">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </AuthContext>
      </body>
    </html>
  );
}
