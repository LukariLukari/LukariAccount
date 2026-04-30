"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, RefreshCcw, Search, Wallet, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface TopUpRequest {
  id: string;
  amount: number;
  code: string;
  transferContent: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  user: {
    name?: string | null;
    email?: string | null;
    wallet?: { balance: number } | null;
  };
}

function statusMeta(status: string) {
  switch (status) {
    case "PAID":
      return { label: "Đã cộng tiền", className: "bg-green-400/10 text-green-300 border-green-400/20" };
    case "CANCELLED":
      return { label: "Đã hủy", className: "bg-red-400/10 text-red-300 border-red-400/20" };
    case "EXPIRED":
      return { label: "Hết hạn", className: "bg-paper/5 text-paper/35 border-paper/10" };
    default:
      return { label: "Chờ xác nhận", className: "bg-[#FF8C00]/10 text-[#FFB45C] border-[#FF8C00]/20" };
  }
}

export default function AdminTopUpsPage() {
  const [topUps, setTopUps] = useState<TopUpRequest[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const fetchTopUps = async (nextStatus = status, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    if (showLoading) setError("");
    try {
      const res = await fetch(`/api/admin/topups?status=${nextStatus}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải yêu cầu nạp");
      setTopUps(data.topUpRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải yêu cầu nạp");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadTopUps() {
      try {
        const res = await fetch(`/api/admin/topups?status=${status}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tải yêu cầu nạp");
        if (isActive) {
          setTopUps(data.topUpRequests || []);
          setError("");
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Không thể tải yêu cầu nạp");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadTopUps();
    return () => {
      isActive = false;
    };
  }, [status]);

  const filteredTopUps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return topUps;
    return topUps.filter((item) =>
      [item.code, item.transferContent, item.user.email || "", item.user.name || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, topUps]);

  const updateTopUp = async (id: string, action: "confirm" | "cancel") => {
    setActionId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/topups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật yêu cầu");
      await fetchTopUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật yêu cầu");
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#FF8C00]">
            Wallet Control
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-paper md:text-4xl">
            Yêu cầu nạp tiền
          </h1>
        </div>
        <button
          type="button"
          onClick={() => fetchTopUps()}
          className="ui-btn ui-btn-secondary self-start rounded-2xl px-4 py-3"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/20" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo mã, nội dung CK hoặc email..."
            className="w-full rounded-2xl border border-paper/10 bg-paper/5 py-4 pl-11 pr-4 text-xs font-bold uppercase tracking-widest text-paper outline-none placeholder:text-paper/20 focus:border-paper/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["PENDING", "PAID", "CANCELLED", "all"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`ui-btn shrink-0 rounded-2xl px-4 py-3 ${
                status === value
                  ? "ui-btn-primary"
                  : "ui-btn-secondary"
              }`}
            >
              {value === "all" ? "Tất cả" : statusMeta(value).label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-[11px] font-bold uppercase tracking-widest text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="rounded-[2rem] border border-paper/10 bg-paper/5 p-10 text-center text-[11px] font-bold uppercase tracking-widest text-paper/35">
            Đang tải yêu cầu...
          </div>
        ) : filteredTopUps.length === 0 ? (
          <div className="rounded-[2rem] border border-paper/10 bg-paper/5 p-10 text-center text-[11px] font-bold uppercase tracking-widest text-paper/35">
            Chưa có yêu cầu phù hợp.
          </div>
        ) : (
          filteredTopUps.map((item) => {
            const meta = statusMeta(item.status);
            return (
              <div key={item.id} className="rounded-[2rem] border border-paper/10 bg-paper/5 p-5 shadow-xl md:p-6">
                <div className="mb-5 flex flex-col gap-4 border-b border-paper/10 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black uppercase tracking-tight text-paper">{item.code}</span>
                      <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-paper/35">
                      {item.user.name || "Khách hàng"} - {item.user.email || "Không có email"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-black text-[#FF8C00]">{formatPrice(item.amount)}₫</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-paper/35">
                      Số dư hiện tại {formatPrice(item.user.wallet?.balance || 0)}₫
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-paper/10 bg-asphalt/40 p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-paper/25">Nội dung CK</p>
                    <p className="break-all text-sm font-bold text-paper">{item.transferContent}</p>
                  </div>
                  <div className="rounded-2xl border border-paper/10 bg-asphalt/40 p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-paper/25">Tạo lúc</p>
                    <p className="text-sm font-bold text-paper">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {item.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateTopUp(item.id, "confirm")}
                          disabled={actionId === item.id}
                          className="ui-btn ui-on-paper rounded-2xl border-green-400 bg-green-400 px-4 py-3 shadow-xl hover:scale-[1.01]"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTopUp(item.id, "cancel")}
                          disabled={actionId === item.id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Hủy
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-paper/35">
                        {item.status === "PAID" ? <Wallet className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        Đã xử lý
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
