"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/");
    }
  }, [session?.status, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);
      if (callback?.ok) {
        router.push("/");
      }
      if (callback?.error) {
        alert("Sai email hoặc mật khẩu!");
      }
    });
  };

  return (
    <div className="min-h-screen bg-asphalt flex items-center justify-center p-6 selection:bg-paper selection:text-asphalt">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-2xl border border-paper/10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-akina font-black text-paper mb-3 tracking-tighter uppercase">
              Chào mừng trở lại
            </h1>
            <p className="text-paper/40 font-akina text-[10px] uppercase tracking-[0.2em]">
              Đăng nhập để tiếp tục mua sắm
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-paper/20 group-focus-within:text-paper transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  placeholder="Email của bạn"
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-paper/5 border border-transparent focus:border-paper/20 focus:bg-paper/10 rounded-2xl outline-none transition-all font-akina text-[11px] placeholder:text-paper/20 text-paper"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-paper/20 group-focus-within:text-paper transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  placeholder="Mật khẩu"
                  required
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-paper/5 border border-transparent focus:border-paper/20 focus:bg-paper/10 rounded-2xl outline-none transition-all font-akina text-[11px] placeholder:text-paper/20 text-paper"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl !bg-[#efede3] !text-[#302f2c] font-akina font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ backgroundColor: '#efede3', color: '#302f2c' }}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              <ArrowRight className="w-4 h-4 !text-[#302f2c]" style={{ color: '#302f2c' }} />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-paper/30 font-akina text-[10px] uppercase tracking-wider">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="text-paper font-black hover:underline underline-offset-4 ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-paper/20 font-akina text-[9px] uppercase tracking-[0.3em] hover:text-paper transition-colors">
            ← Trở lại trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
