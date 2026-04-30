"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Plus, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface WalletData {
  wallet: { balance: number };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    note?: string | null;
    createdAt: string | Date;
  }>;
  topUpRequests: Array<{
    id: string;
    amount: number;
    code: string;
    transferContent: string;
    status: string;
    createdAt: string | Date;
    expiresAt?: string | Date | null;
  }>;
}

interface BankInfo {
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
}

const quickAmounts = [50000, 100000, 200000, 500000];

function statusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Đã cộng tiền";
    case "CANCELLED":
      return "Đã hủy";
    case "EXPIRED":
      return "Hết hạn";
    default:
      return "Chờ xác nhận";
  }
}

export default function WalletPanel({ initialData }: { initialData: WalletData }) {
  const [data, setData] = useState(initialData);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [amount, setAmount] = useState(quickAmounts[1]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const pendingTopUp = data.topUpRequests.find((item) => item.status === "PENDING");

  const refreshWallet = async () => {
    const res = await fetch("/api/wallet");
    if (!res.ok) return;
    setData(await res.json());
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setBankInfo)
      .catch(() => {});
  }, []);

  const copyText = async (key: string, value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 1600);
  };

  const createTopUp = async () => {
    setIsCreating(true);
    setError("");
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Không thể tạo yêu cầu nạp");
      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo yêu cầu nạp");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-paper/5 border border-paper/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF8C00]">
            Ví tài khoản
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-paper">
            {formatPrice(data.wallet.balance)}₫
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8C00]/15 text-[#FF8C00]">
          <Wallet className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-paper/10 bg-asphalt/40 p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/40">
          Tạo yêu cầu nạp tiền
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
                amount === value
                  ? "border-[#FF8C00] bg-[#FF8C00] text-asphalt"
                  : "border-paper/10 bg-paper/5 text-paper/45 hover:text-paper"
              }`}
            >
              {formatPrice(value)}₫
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min={10000}
            step={10000}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="min-w-0 flex-1 rounded-xl border border-paper/10 bg-paper/5 px-4 py-3 text-sm font-bold text-paper outline-none focus:border-paper/30"
          />
          <button
            type="button"
            onClick={createTopUp}
            disabled={isCreating}
            className="ui-btn ui-btn-primary min-w-24 rounded-xl px-4 py-3"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreating ? "Đang tạo" : "Tạo"}</span>
          </button>
        </div>
        {error && <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-400">{error}</p>}
      </div>

      {pendingTopUp && (
        <div className="mb-6 rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/10 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB45C]">
            Yêu cầu nạp đang chờ
          </p>
          <div className="grid gap-3 text-[11px] font-bold uppercase tracking-widest text-paper/50 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-paper/25">Số tiền</p>
              <p className="text-base text-paper">{formatPrice(pendingTopUp.amount)}₫</p>
            </div>
            <div>
              <p className="mb-1 text-paper/25">Nội dung CK</p>
              <button
                type="button"
                onClick={() => copyText("transfer", pendingTopUp.transferContent)}
                className="inline-flex items-center gap-2 text-left text-base text-[#FF8C00]"
              >
                {pendingTopUp.transferContent}
                {copied === "transfer" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <p className="mb-1 text-paper/25">Ngân hàng</p>
              <p className="text-paper">{bankInfo?.bankName || "..."}</p>
            </div>
            <div>
              <p className="mb-1 text-paper/25">Số tài khoản</p>
              <button
                type="button"
                onClick={() => copyText("account", bankInfo?.bankAccount)}
                className="inline-flex items-center gap-2 text-left text-paper"
              >
                {bankInfo?.bankAccount || "..."}
                {copied === "account" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <p className="mb-1 text-paper/25">Chủ tài khoản</p>
              <p className="text-paper">{bankInfo?.bankOwner || "..."}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/35">
            Yêu cầu gần đây
          </h3>
          <div className="space-y-2">
            {data.topUpRequests.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl border border-paper/10 bg-paper/[0.03] p-3">
                <div className="flex justify-between gap-3 text-xs font-bold text-paper">
                  <span>{item.code}</span>
                  <span>{formatPrice(item.amount)}₫</span>
                </div>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-paper/35">
                  {statusLabel(item.status)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/35">
            Lịch sử ví
          </h3>
          <div className="space-y-2">
            {data.transactions.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl border border-paper/10 bg-paper/[0.03] p-3">
                <div className="flex justify-between gap-3 text-xs font-bold">
                  <span className="text-paper/70">{item.note || item.type}</span>
                  <span className={item.amount >= 0 ? "text-green-400" : "text-[#FF8C00]"}>
                    {item.amount >= 0 ? "+" : ""}
                    {formatPrice(item.amount)}₫
                  </span>
                </div>
              </div>
            ))}
            {data.transactions.length === 0 && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-paper/25">
                Chưa có giao dịch ví.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
