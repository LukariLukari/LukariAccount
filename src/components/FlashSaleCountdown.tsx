"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { isFlashSaleActive } from "@/lib/product-pricing";

interface FlashSaleCountdownProps {
  product: Product;
  compact?: boolean;
}

function getRemainingTime(endsAt?: string | Date | null) {
  if (!endsAt) return null;
  const endTime = new Date(endsAt).getTime();
  if (!Number.isFinite(endTime)) return null;

  const remainingMs = Math.max(0, endTime - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

function formatTime(value: number) {
  return String(value).padStart(2, "0");
}

export default function FlashSaleCountdown({ product, compact = false }: FlashSaleCountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const active = isFlashSaleActive(product, new Date(now));
  const remaining = useMemo(() => getRemainingTime(product.flashSaleEndsAt), [product.flashSaleEndsAt, now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!active) return null;

  if (compact) {
    return (
      <div className="font-montserrat text-[14px] font-black leading-none tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-[18px]">
        {remaining && remaining.totalSeconds > 0
          ? `${remaining.days > 0 ? `${remaining.days}N ` : ""}${formatTime(remaining.hours)}:${formatTime(remaining.minutes)}:${formatTime(remaining.seconds)}`
          : "Đang sale"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-200">
        Flash sale đang diễn ra
      </div>
      {remaining && remaining.totalSeconds > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {[
            ["Ngày", remaining.days],
            ["Giờ", remaining.hours],
            ["Phút", remaining.minutes],
            ["Giây", remaining.seconds],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <p className="font-montserrat text-3xl font-black leading-none text-paper drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)] md:text-5xl">
                {formatTime(Number(value))}
              </p>
              <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-paper/45">{label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-bold text-paper">Ưu đãi đang mở, chưa đặt thời gian kết thúc.</p>
      )}
    </div>
  );
}
