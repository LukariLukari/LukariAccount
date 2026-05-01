"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Wallet, X } from "lucide-react";
import type { FreeResource } from "@/lib/resources";
import { formatPrice } from "@/lib/utils";

interface ResourcesClientProps {
  resources: FreeResource[];
  mode?: "free" | "paid";
}

export default function ResourcesClient({ resources, mode = "free" }: ResourcesClientProps) {
  const [activeResource, setActiveResource] = useState<FreeResource | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [confirmResource, setConfirmResource] = useState<FreeResource | null>(null);
  const [showTopUpPopup, setShowTopUpPopup] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/resources/access")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data?.authenticated));
        setWalletBalance(Number(data?.walletBalance) || 0);
        setPurchasedIds(Array.isArray(data?.purchasedResourceIds) ? data.purchasedResourceIds : []);
      })
      .catch(() => {});
  }, []);

  const categories = useMemo(
    () => ["Tất cả", ...Array.from(new Set(resources.map((resource) => resource.category)))],
    [resources]
  );

  const isUnlocked = (resource: FreeResource) =>
    !resource.isPaid || resource.price <= 0 || purchasedIds.includes(resource.id);

  const filteredResources = useMemo(() => {
    const byCategory =
      selectedCategory === "Tất cả"
        ? resources
        : resources.filter((resource) => resource.category === selectedCategory);

    if (mode === "paid") {
      return byCategory.filter((resource) => resource.isPaid && resource.price > 0);
    }

    return byCategory.filter((resource) => !resource.isPaid || resource.price <= 0);
  }, [mode, resources, selectedCategory]);

  const openResourceDetails = (resource: FreeResource) => {
    setActiveResource(resource);
    setActiveImageIndex(0);
  };

  const startPurchase = (resource: FreeResource) => {
    setError("");
    if (!isAuthenticated) {
      window.location.href = "/auth/login?callbackUrl=/resources";
      return;
    }
    if (walletBalance < resource.price) {
      setShowTopUpPopup(true);
      return;
    }
    setConfirmResource(resource);
  };

  const confirmPurchase = async () => {
    if (!confirmResource) return;

    setIsPurchasing(true);
    setError("");
    try {
      const res = await fetch("/api/resources/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: confirmResource.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "INSUFFICIENT_BALANCE") {
          setConfirmResource(null);
          setShowTopUpPopup(true);
          return;
        }
        throw new Error("Không thể thanh toán tài nguyên");
      }

      const nextBalance = Number(data?.walletBalance) || 0;
      setWalletBalance(nextBalance);
      setPurchasedIds((prev) => (prev.includes(confirmResource.id) ? prev : [...prev, confirmResource.id]));
      setConfirmResource(null);

      if (data?.driveUrl) {
        window.open(data.driveUrl, "_blank", "noopener,noreferrer");
      }
    } catch (purchaseError) {
      setError(purchaseError instanceof Error ? purchaseError.message : "Không thể thanh toán tài nguyên");
    } finally {
      setIsPurchasing(false);
    }
  };

  const moveActiveImage = (direction: "prev" | "next") => {
    if (!activeResource || activeResource.images.length <= 1) return;
    setActiveImageIndex((current) => {
      const offset = direction === "next" ? 1 : -1;
      return (current + offset + activeResource.images.length) % activeResource.images.length;
    });
  };

  const ResourceCard = ({ resource }: { resource: FreeResource }) => (
    <div
      className={`group flex min-h-[178px] flex-col rounded-[1.25rem] border p-3 transition-all ${
        resource.isPaid && resource.price > 0
          ? "border-[#FF8C00]/35 bg-[#FF8C00]/[0.06]"
          : "border-paper/10 bg-paper/[0.03]"
      }`}
    >
      <div className="flex min-h-0 flex-1 items-start gap-2.5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem] border border-paper/10 bg-paper/5">
          {resource.images[0] ? (
            <Image src={resource.images[0]} alt={resource.title} fill sizes="48px" className="object-cover" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[7px] font-montserrat font-bold uppercase tracking-[0.16em] text-[#FF8C00]">
            #{resource.order + 1} - {resource.category}
          </p>
          <h2 className="mb-1 truncate font-montserrat text-[1.05rem] font-bold uppercase tracking-tight text-paper">
            {resource.title}
          </h2>
          <p className="min-h-[2rem] font-montserrat text-[11px] leading-relaxed text-paper/50 line-clamp-2">
            {resource.description}
          </p>
          {resource.isPaid && resource.price > 0 ? (
            <div className="mt-2 inline-flex items-center rounded-full bg-[#FF8C00]/20 px-3 py-1.5">
              <span className="font-montserrat text-[14px] font-black tracking-normal text-[#FFB45C]">
                {formatPrice(resource.price)}₫
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
        <button
          onClick={() => openResourceDetails(resource)}
          className="ui-btn ui-btn-primary min-w-0 rounded-xl px-3 py-2 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em]"
        >
          <Eye className="h-3.5 w-3.5 !text-asphalt" />
          <span className="whitespace-nowrap text-asphalt">Chi tiết</span>
        </button>

        {resource.driveUrl && isUnlocked(resource) ? (
          <a
            href={resource.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-btn ui-btn-secondary min-w-0 rounded-xl px-3 py-2 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap text-paper">Mở Drive</span>
          </a>
        ) : null}

        {resource.driveUrl && !isUnlocked(resource) ? (
          <button
            onClick={() => startPurchase(resource)}
            className="ui-btn ui-btn-secondary min-w-0 rounded-xl px-3 py-2 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em]"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap text-paper">Mua bằng ví</span>
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className={`font-montserrat text-2xl font-black uppercase tracking-tight md:text-3xl ${
              mode === "paid" ? "text-[#FFB45C]" : "text-paper"
            }`}
          >
            {mode === "paid" ? "Tài nguyên trả phí" : "Tài nguyên miễn phí"}
          </h1>
          <p className="mt-1 font-montserrat text-[11px] font-bold uppercase tracking-[0.16em] text-paper/35">
            {mode === "paid" ? "Mua bằng số dư ví và mở khóa vĩnh viễn" : "Mở Drive trực tiếp sau một lần bấm"}
          </p>
        </div>

        <div className="inline-flex rounded-full border border-paper/10 bg-paper/[0.04] p-1">
          <Link
            href="/resources/free"
            className={`rounded-full px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
              mode === "free" ? "bg-paper text-asphalt" : "text-paper/55 hover:text-paper"
            }`}
          >
            Miễn phí
          </Link>
          <Link
            href="/resources/paid"
            className={`rounded-full px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
              mode === "paid" ? "bg-[#FF8C00] text-asphalt" : "text-paper/55 hover:text-paper"
            }`}
          >
            Trả phí
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="ui-btn ui-btn-secondary rounded-xl px-3 py-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.08em]"
          >
            {category}
          </button>
        ))}
      </div>

      {filteredResources.length > 0 ? (
        <section>
          <div
            className={`grid gap-3 ${
              mode === "paid"
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5"
            }`}
          >
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      ) : (
        <p className="font-montserrat text-sm text-paper/40">Không có tài nguyên trong mục này.</p>
      )}

      <AnimatePresence>
        {confirmResource ? (
          <div className="fixed inset-0 z-[360] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setConfirmResource(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-paper/10 bg-asphalt p-6"
            >
              <h3 className="mb-2 font-montserrat text-lg font-black uppercase text-paper">Xác nhận mua tài nguyên</h3>
              <p className="mb-4 font-montserrat text-sm text-paper/70">{confirmResource.title}</p>
              <div className="space-y-2 font-montserrat text-sm">
                <p className="text-paper/70">
                  Giá: <span className="font-bold text-[#FFB45C]">{formatPrice(confirmResource.price)}₫</span>
                </p>
                <p className="text-paper/70">
                  Số dư hiện tại: <span className="font-bold">{formatPrice(walletBalance)}₫</span>
                </p>
                <p className="text-paper/70">
                  Số dư sau khi mua: <span className="font-bold text-[#FFB45C]">{formatPrice(walletBalance - confirmResource.price)}₫</span>
                </p>
              </div>
              {error ? <p className="mt-3 font-montserrat text-xs text-red-400">{error}</p> : null}
              <div className="mt-5 flex gap-2">
                <button
                  className="ui-btn ui-btn-secondary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                  onClick={() => setConfirmResource(null)}
                >
                  Hủy
                </button>
                <button
                  className="ui-btn ui-btn-primary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                  onClick={confirmPurchase}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? "Đang xử lý..." : "Xác nhận mua"}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showTopUpPopup ? (
          <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowTopUpPopup(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-paper/10 bg-asphalt p-6"
            >
              <p className="mb-3 font-montserrat text-sm font-bold text-paper">
                Số dư ví không đủ. Vui lòng nạp thêm để mở tài nguyên.
              </p>
              <div className="flex gap-2">
                <button
                  className="ui-btn ui-btn-secondary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                  onClick={() => setShowTopUpPopup(false)}
                >
                  Đóng
                </button>
                <a
                  href="/profile"
                  className="ui-btn ui-btn-primary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                >
                  Nạp tiền
                </a>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeResource ? (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setActiveResource(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-paper/10 bg-[#1a1917] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            >
              <button
                onClick={() => setActiveResource(null)}
                className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2 text-paper/70"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="border-b border-paper/10 bg-black/10 p-4 lg:border-b-0 lg:border-r lg:p-5">
                  <motion.div
                    className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-paper/10 bg-paper/5"
                    drag={activeResource.images.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_, info) => {
                      if (activeResource.images.length <= 1) return;
                      const swipeDistance = Math.abs(info.offset.x);
                      const swipeVelocity = Math.abs(info.velocity.x);
                      if (swipeDistance > 60 || swipeVelocity > 500) {
                        moveActiveImage(info.offset.x < 0 ? "next" : "prev");
                      }
                    }}
                  >
                    {activeResource.images[activeImageIndex] ? (
                      <Image
                        src={activeResource.images[activeImageIndex]}
                        alt={`${activeResource.title} demo ${activeImageIndex + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-montserrat text-sm font-bold uppercase tracking-[0.12em] text-paper/25">
                        Không có ảnh demo
                      </div>
                    )}

                    {activeResource.images.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => moveActiveImage("prev")}
                          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-paper/15 bg-black/45 text-paper/70 backdrop-blur-md transition hover:bg-paper hover:text-asphalt"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveActiveImage("next")}
                          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-paper/15 bg-black/45 text-paper/70 backdrop-blur-md transition hover:bg-paper hover:text-asphalt"
                          aria-label="Ảnh sau"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-paper/10 bg-black/45 px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em] text-paper/70 backdrop-blur-md">
                          {activeImageIndex + 1} / {activeResource.images.length}
                        </div>
                      </>
                    ) : null}
                  </motion.div>

                  {activeResource.images.length > 1 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeResource.images.map((image, index) => (
                        <button
                          key={`${activeResource.id}-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative h-16 w-16 overflow-hidden rounded-xl border transition-all ${
                            activeImageIndex === index
                              ? "border-[#FF8C00] shadow-[0_0_0_1px_rgba(255,140,0,0.35)]"
                              : "border-paper/10 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${activeResource.title} preview ${index + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="p-6 lg:p-7">
                  <p className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                    {activeResource.category}
                  </p>
                  <h3 className="mb-3 font-montserrat text-2xl font-black uppercase tracking-tight">{activeResource.title}</h3>

                  {activeResource.isPaid && activeResource.price > 0 ? (
                    <div className="mb-4 inline-flex items-center rounded-full bg-[#FF8C00]/15 px-4 py-2">
                      <span className="font-montserrat text-lg font-black text-[#FFB45C]">{formatPrice(activeResource.price)}₫</span>
                    </div>
                  ) : null}

                  <p className="font-montserrat text-sm leading-relaxed text-paper/65 whitespace-pre-line">
                    {activeResource.detailDescription || activeResource.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {activeResource.driveUrl && isUnlocked(activeResource) ? (
                      <a
                        href={activeResource.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui-btn ui-btn-primary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                      >
                        <ExternalLink className="h-4 w-4 !text-asphalt" />
                        <span className="text-asphalt">Mở Drive</span>
                      </a>
                    ) : null}

                    {activeResource.driveUrl && !isUnlocked(activeResource) ? (
                      <button
                        onClick={() => startPurchase(activeResource)}
                        className="ui-btn ui-btn-secondary px-4 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]"
                      >
                        <Wallet className="h-4 w-4" />
                        <span className="text-paper">Mua bằng ví</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
