"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
    );
  }

  if (status === "unauthenticated") {
    return (
      <Link 
        href="/auth/login"
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-black/80 transition-all shadow-lg shadow-black/10 group"
      >
        <User className="w-3.5 h-3.5" />
        <span className="text-[10px] font-akina font-black uppercase tracking-widest">Đăng nhập</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-full bg-white border border-black/5 hover:border-black/10 transition-all group"
      >
        {session?.user?.image ? (
          <img 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            className="w-7 h-7 rounded-full object-cover border border-black/10"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
            <User className="w-3.5 h-3.5 text-black/40" />
          </div>
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-akina font-black text-black uppercase tracking-tight">
            {session?.user?.name?.split(" ")[0]}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 text-black/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-black/[0.03] overflow-hidden z-40 p-2"
            >
              <div className="px-4 py-3 mb-2 border-b border-black/5">
                <p className="text-[9px] font-akina font-bold text-black/30 uppercase tracking-widest mb-1">Tài khoản</p>
                <p className="text-[11px] font-akina font-black text-black truncate">{session?.user?.email}</p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.02] transition-colors group">
                <Settings className="w-4 h-4 text-black/20 group-hover:text-black transition-colors" />
                <span className="text-[11px] font-akina font-bold text-black/60 group-hover:text-black">Cài đặt</span>
              </button>

              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors group"
              >
                <LogOut className="w-4 h-4 text-red-400/50 group-hover:text-red-500 transition-colors" />
                <span className="text-[11px] font-akina font-bold text-red-400 group-hover:text-red-500">Đăng xuất</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
