import type { Metadata } from "next";
import { Outfit, Syne, Montserrat } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

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
  title: "LukariAccount - Premium Software & Account Store",
  description: "Cửa hàng cung cấp tài khoản và phần mềm bản quyền cao cấp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} ${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
