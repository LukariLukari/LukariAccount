"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  TicketPercent, 
  Users, 
  Settings, 
  Wallet,
  Zap,
  ArrowLeft,
  LogOut,
  LayoutGrid,
  Image as ImageIcon,
  BookOpen,
  FileText
} from "lucide-react";
import { signOut } from "next-auth/react";

export const adminMenuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: ShoppingBag, label: "Sản phẩm", href: "/admin/products" },
  { icon: Zap, label: "Flash sale", href: "/admin/flash-sale" },
  { icon: TicketPercent, label: "Đơn hàng", href: "/admin/orders" },
  { icon: Wallet, label: "Nạp tiền", href: "/admin/topups" },
  { icon: LayoutGrid, label: "Loại sản phẩm", href: "/admin/categories" },
  { icon: ImageIcon, label: "Banner", href: "/admin/banners" },
  { icon: BookOpen, label: "Tài nguyên", href: "/admin/resources" },
  { icon: FileText, label: "Template", href: "/admin/product-templates" },
  { icon: TicketPercent, label: "Mã giảm giá", href: "/admin/coupons" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-asphalt border-r border-paper/10 flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-asphalt font-montserrat font-bold">
          L
        </div>
        <span className="font-montserrat font-bold text-lg text-paper uppercase tracking-tighter">
          Admin CP
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 mb-4">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group shrink-0 ${
                isActive 
                  ? "ui-on-paper bg-paper shadow-xl" 
                  : "text-paper/40 hover:text-paper hover:bg-paper/5"
              }`}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-montserrat font-bold text-[11px] uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-paper/10">
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-paper/40 hover:text-paper hover:bg-paper/5 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-montserrat font-bold text-[11px] uppercase tracking-widest">
            Về cửa hàng
          </span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-montserrat font-bold text-[11px] uppercase tracking-widest">
            Đăng xuất
          </span>
        </button>
      </div>
    </aside>
  );
}
