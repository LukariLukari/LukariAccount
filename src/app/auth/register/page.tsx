"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/register", data);
      alert("Đăng ký thành công! Đang chuyển đến trang đăng nhập.");
      router.push("/auth/login");
    } catch (error: any) {
      alert("Có lỗi xảy ra: " + (error.response?.data || "Email đã tồn tại!"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/[0.03]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-akina font-black text-black mb-3 tracking-tighter uppercase">
              Tạo tài khoản
            </h1>
            <p className="text-black/40 font-akina text-[10px] uppercase tracking-[0.2em]">
              Gia nhập cộng đồng LukariAccount
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-black/20 group-focus-within:text-black transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  placeholder="Họ và tên"
                  required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-black/[0.02] border border-transparent focus:border-black/10 focus:bg-white rounded-2xl outline-none transition-all font-akina text-[11px] placeholder:text-black/20 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-black/20 group-focus-within:text-black transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  placeholder="Email của bạn"
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-black/[0.02] border border-transparent focus:border-black/10 focus:bg-white rounded-2xl outline-none transition-all font-akina text-[11px] placeholder:text-black/20 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-black/20 group-focus-within:text-black transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  placeholder="Mật khẩu"
                  required
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-black/[0.02] border border-transparent focus:border-black/10 focus:bg-white rounded-2xl outline-none transition-all font-akina text-[11px] placeholder:text-black/20 text-black"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-black text-white font-akina font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black/80 transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo tài khoản"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-black/30 font-akina text-[10px] uppercase tracking-wider">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="text-black font-black hover:underline underline-offset-4 ml-1">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-black/20 font-akina text-[9px] uppercase tracking-[0.3em] hover:text-black transition-colors">
            ← Trở lại trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
