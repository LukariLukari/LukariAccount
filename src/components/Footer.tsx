"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  zaloLink: string;
  facebookLink: string;
  tiktokLink: string;
  telegramLink: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch footer settings");
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="w-full bg-[#1a1917] border-t border-paper/5 mt-auto overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 min-w-0">
            <div className="flex items-center gap-3 mb-5 sm:mb-6 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-paper rounded-full flex items-center justify-center text-asphalt font-montserrat font-bold text-lg sm:text-xl shadow-xl shrink-0">
                L
              </div>
              <span className="font-montserrat font-bold text-lg sm:text-xl tracking-tighter text-paper uppercase truncate">
                LukariAccount
              </span>
            </div>
            <p className="text-paper/35 text-sm sm:text-xs font-bold leading-relaxed mb-6 max-w-sm">
              Cửa hàng cung cấp tài khoản và phần mềm bản quyền cao cấp. Uy tín - Chất lượng - Giá tốt.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] text-paper/30 mb-4 sm:mb-6">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Trang chủ", href: "/" },
                { label: "Sản phẩm", href: "/products" },
                { label: "Tài nguyên miễn phí", href: "/resources" },
                { label: "Giỏ hàng", href: "/cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-paper/45 hover:text-paper text-[13px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] text-paper/30 mb-4 sm:mb-6">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              {settings?.phone && (
                <li className="text-paper/45 text-[13px] sm:text-xs font-bold break-words">
                  📞 <span className="text-paper/60">{settings.phone}</span>
                </li>
              )}
              {settings?.email && (
                <li className="text-paper/45 text-[13px] sm:text-xs font-bold break-words">
                  ✉️ <span className="text-paper/60">{settings.email}</span>
                </li>
              )}
              {settings?.address && (
                <li className="text-paper/45 text-[13px] sm:text-xs font-bold break-words">
                  📍 <span className="text-paper/60">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] text-paper/30 mb-4 sm:mb-6">
              Mạng xã hội
            </h3>
            <div className="flex flex-wrap gap-3">
              {settings?.facebookLink && (
                <a
                  href={settings.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-paper/5 border border-paper/10 flex items-center justify-center text-paper/40 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {settings?.tiktokLink && (
                <a
                  href={settings.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-paper/5 border border-paper/10 flex items-center justify-center text-paper/40 hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
              {settings?.zaloLink && (
                <a
                  href={settings.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-paper/5 border border-paper/10 flex items-center justify-center text-paper/40 hover:bg-blue-400/20 hover:text-blue-300 hover:border-blue-400/30 transition-all duration-300 text-[10px] font-bold"
                >
                  Z
                </a>
              )}
              {settings?.telegramLink && (
                <a
                  href={settings.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-paper/5 border border-paper/10 flex items-center justify-center text-paper/40 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-paper/5 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <p className="text-paper/25 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} LukariAccount. All rights reserved.
          </p>
          <p className="text-paper/25 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
            Made with ❤️ by Lukari
          </p>
        </div>
      </div>
    </footer>
  );
}
