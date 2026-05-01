"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SessionRecovery({
  callbackUrl,
  message,
}: {
  callbackUrl: string;
  message?: string;
}) {
  useEffect(() => {
    void signOut({ callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="min-h-screen bg-asphalt text-paper font-montserrat flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-paper/10 bg-paper/5 p-8 text-center shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF8C00]">
          Phiên đăng nhập
        </p>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">
          Đang làm mới phiên
        </h1>
        <p className="mt-3 text-sm text-paper/60">
          {message || "Phiên hiện tại không còn hợp lệ. Vui lòng đăng nhập lại."}
        </p>
      </div>
    </div>
  );
}
