"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Search, Trash2, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/data";
import { formatPrice, parseFormattedPrice } from "@/lib/utils";
import { isFlashSaleActive } from "@/lib/product-pricing";

type Toast = {
  id: number;
  title: string;
  message: string;
  type: "success" | "error";
};

function toDateTimeLocal(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | Date);
  if (!Number.isFinite(date.getTime())) return "";

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoDateOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export default function AdminFlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [customSalePrices, setCustomSalePrices] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast("Lỗi", "Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setStartsAt(toDateTimeLocal(now));
    setEndsAt(toDateTimeLocal(tomorrow));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const activeFlashSaleCount = products.filter((product) => isFlashSaleActive(product)).length;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredProducts.map((product) => product.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const buildFlashSalePrices = () => {
    const percent = Math.min(99, Math.max(1, Number(discountPercent) || 1));
    return selectedProducts.map((product) => ({
      id: product.id,
      flashSalePrice:
        customSalePrices[product.id] !== undefined
          ? customSalePrices[product.id]
          : Math.max(0, Math.floor(product.price * (1 - percent / 100))),
    }));
  };

  const updateCustomSalePrice = (productId: string, value: string) => {
    setCustomSalePrices((prev) => ({
      ...prev,
      [productId]: parseFormattedPrice(value),
    }));
  };

  const applyFlashSale = async () => {
    if (selectedIds.length === 0) {
      showToast("Chưa chọn sản phẩm", "Hãy chọn ít nhất 1 sản phẩm để áp flash sale.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/products/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          data: {
            flashSalePricesById: buildFlashSalePrices(),
            flashSaleStartsAt: toIsoDateOrNull(startsAt),
            flashSaleEndsAt: toIsoDateOrNull(endsAt),
          },
        }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || "Không thể áp dụng flash sale.");
      showToast("Thành công", result?.message || "Đã áp dụng flash sale.");
      setSelectedIds([]);
      setCustomSalePrices({});
      await fetchProducts();
    } catch (error) {
      showToast("Lỗi", error instanceof Error ? error.message : "Không thể áp dụng flash sale.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const clearFlashSale = async () => {
    if (selectedIds.length === 0) {
      showToast("Chưa chọn sản phẩm", "Hãy chọn sản phẩm cần gỡ flash sale.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/products/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          data: {
            flashSalePrice: null,
            flashSaleStartsAt: null,
            flashSaleEndsAt: null,
          },
        }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || "Không thể gỡ flash sale.");
      showToast("Thành công", result?.message || "Đã gỡ flash sale.");
      setSelectedIds([]);
      setCustomSalePrices({});
      await fetchProducts();
    } catch (error) {
      showToast("Lỗi", error instanceof Error ? error.message : "Không thể gỡ flash sale.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FF8C00]">Flash sale</p>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-paper lg:text-3xl">
            Quản lý flash sale
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-relaxed text-paper/40">
            Chọn nhiều sản phẩm, nhập phần trăm giảm và khung thời gian để mở ưu đãi cùng lúc.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-2xl border border-paper/10 bg-paper/5 px-5 py-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-paper/30">Đang chạy</p>
            <p className="mt-1 text-xl font-black text-[#FF8C00]">{activeFlashSaleCount}</p>
          </div>
          <div className="rounded-2xl border border-paper/10 bg-paper/5 px-5 py-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-paper/30">Đã chọn</p>
            <p className="mt-1 text-xl font-black text-paper">{selectedIds.length}</p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 rounded-[2rem] border border-paper/10 bg-paper/5 p-5 shadow-2xl lg:grid-cols-[180px_1fr_1fr_auto] lg:items-end">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-paper/35">Giảm giá (%)</label>
          <input
            type="number"
            min={1}
            max={99}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full rounded-2xl border border-paper/10 bg-asphalt/50 px-5 py-4 text-sm font-bold text-[#FF8C00] outline-none focus:border-[#FF8C00]/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-paper/35">Bắt đầu</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-2xl border border-paper/10 bg-asphalt/50 px-5 py-4 text-sm font-bold text-paper outline-none focus:border-[#FF8C00]/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-paper/35">Kết thúc</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-2xl border border-paper/10 bg-asphalt/50 px-5 py-4 text-sm font-bold text-paper outline-none focus:border-[#FF8C00]/50"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <button
            type="button"
            onClick={applyFlashSale}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-paper px-6 py-4 text-[10px] font-bold uppercase tracking-widest !text-asphalt transition hover:scale-[1.02] disabled:opacity-50"
          >
            <Zap className="h-4 w-4 !text-asphalt" />
            Áp dụng
          </button>
          <button
            type="button"
            onClick={clearFlashSale}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-red-200 transition hover:bg-red-400/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Gỡ sale
          </button>
        </div>
      </section>

      {selectedProducts.length > 0 && (
        <section className="rounded-[2rem] border border-[#FF8C00]/15 bg-[#FF8C00]/5 p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB45C]">Giá flash sale</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-paper/30">
                Giá tự tính theo % giảm, có thể sửa trực tiếp từng sản phẩm trước khi áp dụng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomSalePrices({})}
              className="self-start rounded-xl border border-paper/10 bg-paper/5 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-paper/45 transition hover:bg-paper hover:text-asphalt md:self-auto"
            >
              Tính lại theo %
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {buildFlashSalePrices().map((item) => {
              const product = products.find((candidate) => candidate.id === item.id);
              if (!product) return null;
              return (
                <div key={item.id} className="min-w-[220px] rounded-2xl border border-paper/10 bg-asphalt/30 p-4">
                  <p className="line-clamp-1 text-xs font-bold uppercase text-paper">{product.name}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-paper/30 line-through">{formatPrice(product.price)}₫</span>
                  </div>
                  <input
                    type="text"
                    value={formatPrice(item.flashSalePrice)}
                    onChange={(event) => updateCustomSalePrice(product.id, event.target.value)}
                    className="mt-3 w-full rounded-xl border border-paper/10 bg-asphalt/60 px-4 py-3 text-sm font-black text-[#FF8C00] outline-none focus:border-[#FF8C00]/50"
                    aria-label={`Giá flash sale ${product.name}`}
                  />
                  <div className="mt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-paper/30">
                    <span>Giá sale</span>
                    <span>
                      {product.price > 0
                        ? `-${Math.max(0, Math.round((1 - item.flashSalePrice / product.price) * 100))}%`
                        : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/20" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-paper/10 bg-paper/5 py-3.5 pl-12 pr-5 text-[11px] font-bold uppercase tracking-widest text-paper outline-none placeholder:text-paper/20 focus:border-paper/30"
          />
        </div>
        <button
          type="button"
          onClick={toggleSelectAll}
          className="self-start rounded-2xl border border-paper/10 bg-paper/5 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-paper/50 transition hover:bg-paper hover:text-asphalt md:self-auto"
        >
          {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-paper/10 bg-paper/5 shadow-2xl">
        <table className="w-full min-w-[920px] text-left">
          <thead>
            <tr className="border-b border-paper/10 bg-paper/5">
              <th className="w-12 px-6 py-5">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-paper/20 bg-asphalt checked:bg-[#FF8C00]"
                />
              </th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Sản phẩm</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Giá hiện tại</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Flash sale</th>
              <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper/5">
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <tr key={item} className="animate-pulse">
                  <td colSpan={5} className="bg-paper/5 px-6 py-10" />
                </tr>
              ))
            ) : (
              filteredProducts.map((product) => {
                const active = isFlashSaleActive(product);
                return (
                  <tr key={product.id} className={selectedIds.includes(product.id) ? "bg-[#FF8C00]/5" : ""}>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelectOne(product.id)}
                        className="h-4 w-4 cursor-pointer rounded border-paper/20 bg-asphalt checked:bg-[#FF8C00]"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold uppercase text-paper">{product.name}</p>
                      <p className="mt-1 text-[9px] font-mono text-paper/25">{product.slug}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-[#FF8C00]">{formatPrice(product.price)}₫</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-paper/25">{product.category}</p>
                    </td>
                    <td className="px-6 py-5">
                      {product.flashSalePrice ? (
                        <div>
                          <p className="text-sm font-black text-red-200">{formatPrice(product.flashSalePrice)}₫</p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-paper/25">
                            {product.flashSaleStartsAt ? toDateTimeLocal(product.flashSaleStartsAt).replace("T", " ") : "Luôn bật"} -{" "}
                            {product.flashSaleEndsAt ? toDateTimeLocal(product.flashSaleEndsAt).replace("T", " ") : "Không giới hạn"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-paper/25">Chưa đặt</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${
                          active
                            ? "bg-red-400/15 text-red-200"
                            : product.flashSalePrice
                              ? "bg-paper/10 text-paper/40"
                              : "bg-paper/5 text-paper/25"
                        }`}
                      >
                        {active ? "Đang chạy" : product.flashSalePrice ? "Đã lên lịch" : "Không sale"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {toasts.length > 0 && (
          <div className="fixed right-6 top-6 z-[999] flex w-full max-w-sm flex-col gap-3">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                className={`rounded-[1.75rem] border bg-[#1a1917]/95 p-5 shadow-[0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${
                  toast.type === "success" ? "border-emerald-500/20" : "border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      toast.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-paper">{toast.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-paper/60">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                    className="rounded-full p-1 text-paper/30 transition hover:bg-paper/5 hover:text-paper"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
