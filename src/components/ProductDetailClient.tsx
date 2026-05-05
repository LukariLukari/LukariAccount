"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCcw,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import PaymentPopup from "@/components/PaymentPopup";
import type { Product } from "@/lib/data";
import RichText from "@/components/RichText";
import ProductCard from "@/components/ProductCard";
import { getDisplayOriginalPrice, getEffectiveProductPrice, isFlashSaleActive } from "@/lib/product-pricing";
import FlashSaleCountdown from "@/components/FlashSaleCountdown";

interface Plan {
  type?: string;
  label: string;
  price: number;
  cycle: string;
}

type ContentSectionId = "warranty" | "features" | "instructions" | "details";

const DEFAULT_CONTENT_ORDER: ContentSectionId[] = ["warranty", "features", "instructions", "details"];

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getProductPlans(product: Product): Plan[] {
  const effectivePrice = getEffectiveProductPrice(product);
  if (product.plans && Array.isArray(product.plans) && product.plans.length > 0) {
    return (product.plans as Plan[]).map((plan) => ({
      ...plan,
      price: plan.price === product.price ? effectivePrice : plan.price,
    }));
  }

  return [
    { type: "Mặc định", label: "1 Tháng", price: effectivePrice, cycle: "tháng" },
    { type: "Mặc định", label: "6 Tháng", price: Math.floor(effectivePrice * 5.2), cycle: "6 tháng" },
    { type: "Mặc định", label: "1 Năm", price: Math.floor(effectivePrice * 9.5), cycle: "năm" },
  ];
}

function getTextLines(value?: string | null) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getFeatureItems(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(input) && Array.isArray(input.items)) {
    return input.items.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function getContentOrder(input: unknown): ContentSectionId[] {
  const rawOrder =
    isRecord(input) && Array.isArray(input.sectionOrder)
      ? input.sectionOrder
      : DEFAULT_CONTENT_ORDER;
  const validOrder = rawOrder.filter(
    (item): item is ContentSectionId =>
      typeof item === "string" && DEFAULT_CONTENT_ORDER.includes(item as ContentSectionId)
  );

  return [...validOrder, ...DEFAULT_CONTENT_ORDER.filter((item) => !validOrder.includes(item))];
}

function getWarrantyItems(warranty?: string | null) {
  const lines = getTextLines(warranty);

  const icons = [Zap, RefreshCcw, Shield, Sparkles];
  return lines.map((line, index) => {
    const [title, ...descParts] = line.split(":");
    const hasTitle = descParts.length > 0 && title.trim().length > 0;

    return {
      icon: icons[index % icons.length],
      title: hasTitle ? title.trim() : "",
      desc: hasTitle ? descParts.join(":").trim() : line,
    };
  });
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const plans = useMemo(() => getProductPlans(product), [product]);
  const types = useMemo(
    () => Array.from(new Set(plans.map((plan) => plan.type || "Mặc định"))),
    [plans]
  );
  const [activeType, setActiveType] = useState(types[0] || "Mặc định");

  const filteredPlans = plans.filter((plan) => (plan.type || "Mặc định") === activeType);
  const selectedPlan = filteredPlans[activePlanIdx] || filteredPlans[0] || plans[0];
  const hasFlashSale = isFlashSaleActive(product);
  const displayOriginalPrice = getDisplayOriginalPrice(product);
  const basePlanPrice = filteredPlans[0]?.price || getEffectiveProductPrice(product);
  const totalPrice = selectedPlan.price * quantity;
  const selectedPlanSavings =
    basePlanPrice > 0 && selectedPlan.price < basePlanPrice * quantity
      ? Math.max(0, Math.round((1 - selectedPlan.price / (basePlanPrice * quantity)) * 100))
      : 0;
  const features = useMemo(() => getFeatureItems(product.features), [product.features]);
  const contentOrder = useMemo(() => getContentOrder(product.features), [product.features]);
  const instructions =
    Array.isArray(product.instructions) && product.instructions.length > 0
      ? (product.instructions as string[])
      : [];
  const warrantyItems = useMemo(() => getWarrantyItems(product.warranty), [product.warranty]);
  const detailParagraphs = useMemo(() => getTextLines(product.details), [product.details]);
  const visibleSideContentOrder = contentOrder.filter((sectionId) => {
    if (sectionId === "details") return false;
    if (sectionId === "warranty") return warrantyItems.length > 0;
    if (sectionId === "features") return features.length > 0;
    if (sectionId === "instructions") return instructions.length > 0;
    return false;
  });

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setActivePlanIdx(0);
  };

  const handleAddToCart = () => {
    if (product.isSoldOut) return;
    addToCart({ ...product, price: selectedPlan.price }, quantity);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      await navigator.clipboard.writeText(url);
    }
  };

  const submitOrder = async (note: string, paymentMethod: "bank" | "wallet") => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createOrder: true,
        paymentMethod,
        items: [
          {
            productId: product.id,
            quantity,
            unitPrice: selectedPlan.price,
            planLabel: selectedPlan.label,
          },
        ],
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể xác nhận đơn hàng");
    }
    return { orderCode: data.order?.orderCode };
  };

  const handleSubmitOrder = (note: string) => submitOrder(note, "bank");
  const handleSubmitWalletOrder = (note: string) => submitOrder(note, "wallet");

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="w-full max-w-[1180px] mx-auto px-3 sm:px-5 lg:px-6 pb-28 lg:py-5 overflow-x-hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-montserrat font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full min-w-0 lg:flex-[1.55] bg-paper/5 backdrop-blur-3xl rounded-[1.5rem] lg:rounded-[1.75rem] p-3.5 sm:p-4 lg:p-5 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col justify-center"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[10vw] font-montserrat font-bold tracking-tighter leading-none whitespace-nowrap uppercase italic text-paper opacity-[0.02]">
                {product.name.replace(/\s+/g, "")}
              </span>
            </div>

            <div className="relative z-10 flex flex-col gap-4 h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                className="w-full h-[320px] lg:h-[360px] relative rounded-[1.2rem] lg:rounded-[1.35rem] overflow-hidden shadow-2xl group shrink-0 border border-paper/10"
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-paper/5 flex items-center justify-center text-paper/10 text-6xl font-bold">
                    AI
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-asphalt/40 to-transparent pointer-events-none" />
              </motion.div>

              <div className="w-full flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-paper text-asphalt text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] rounded-full">
                      {product.isSoldOut ? "Tạm hết" : product.category}
                    </span>
                    {hasFlashSale && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/25 bg-red-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-red-200">
                        <Zap className="h-3 w-3" />
                        Flash sale
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF8C00]/25 bg-[#FF8C00]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#FFB45C]">
                        <Sparkles className="h-3 w-3" />
                        Bán chạy
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper/10 bg-paper/5 text-paper/40 transition hover:bg-paper/10 hover:text-paper"
                      aria-label="Chia sẻ sản phẩm"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h1
                    className="text-[1.25rem] sm:text-[1.35rem] lg:text-[1.75rem] font-montserrat font-bold tracking-tight mb-2 leading-none text-paper uppercase truncate max-w-full"
                    title={product.name}
                  >
                    {product.name}
                  </h1>
                  <p className="text-paper text-[13px] leading-relaxed mb-4 max-w-[36rem]">
                    <RichText text={product.description || "Giải pháp phù hợp cho nhu cầu sử dụng lâu dài và ổn định."} />
                  </p>



                  {hasFlashSale && !product.isSoldOut && (
                    <div className="mb-4">
                      <FlashSaleCountdown product={product} />
                    </div>
                  )}

                  <div className="mb-4 space-y-3">
                    {types.length > 1 && (
                      <div>
                        <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-3">
                          Phân loại gói
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {types.map((type) => (
                            <button
                              key={type}
                              onClick={() => handleTypeChange(type)}
                              className={`px-4 py-2 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
                                activeType === type
                                  ? "!text-[#302f2c] !bg-[#efede3] shadow-xl"
                                  : "text-paper/40 bg-paper/5 border-paper/10 hover:border-paper/30"
                              } border`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-3">
                        Thời hạn sử dụng
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {filteredPlans.map((plan, idx) => (
                          <button
                            key={`${plan.label}-${idx}`}
                            onClick={() => setActivePlanIdx(idx)}
                            className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                              activePlanIdx === idx
                                ? "border-paper bg-paper text-asphalt shadow-xl"
                                : "border-paper/10 bg-paper/5 text-paper hover:border-paper/25 hover:bg-paper/10"
                            }`}
                          >
                            <span className={`mb-2 block text-[10px] font-montserrat font-bold uppercase tracking-widest ${activePlanIdx === idx ? "text-asphalt/70" : "text-paper/45"}`}>
                              {plan.label}
                            </span>
                            <span className={`block text-lg font-montserrat font-black ${activePlanIdx === idx ? "text-asphalt" : "text-[#FF8C00]"}`}>
                              {formatPrice(plan.price)}₫
                            </span>
                            <span className={`mt-1 block text-[9px] font-bold uppercase tracking-widest ${activePlanIdx === idx ? "text-asphalt/45" : "text-paper/25"}`}>
                              / {plan.cycle}
                            </span>
                            {activePlanIdx === idx && (
                              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-asphalt" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4 xl:items-end">
                    <div className="flex flex-col gap-1">
                      {activePlanIdx === 0 &&
                        displayOriginalPrice && (
                          <span className="text-sm font-montserrat font-medium text-paper/30 line-through decoration-red-500/50">
                            {formatPrice(displayOriginalPrice)}₫
                          </span>
                        )}
                      <div className="text-[1.75rem] lg:text-[2rem] font-montserrat font-bold text-paper flex items-baseline gap-2">
                        <span className="text-[#FF8C00] drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                          {formatPrice(totalPrice)}₫
                        </span>
                        <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">
                          {quantity > 1 ? `cho ${quantity} sản phẩm` : `/ ${selectedPlan.cycle}`}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-paper/25">
                        Gói {selectedPlan.label} - {formatPrice(selectedPlan.price)}₫ mỗi sản phẩm
                      </p>
                      {selectedPlanSavings > 0 && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-green-400">
                          Tiết kiệm khoảng {selectedPlanSavings}%
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
                      <div className="flex items-center gap-2 rounded-full bg-paper/5 border border-paper/10 p-1">
                        <span className="pl-3 text-[8px] font-montserrat font-bold uppercase tracking-[0.18em] text-paper/30">
                          SL
                        </span>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-montserrat font-bold text-[11px] text-paper">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                        >
                          +
                        </button>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !product.isSoldOut && setShowPayment(true)}
                        disabled={product.isSoldOut}
                        className="flex-1 sm:flex-none min-w-[210px] px-4 sm:px-5 py-2.5 rounded-full !bg-[#efede3] !text-[#302f2c] font-montserrat font-bold text-[9px] uppercase tracking-[0.16em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {product.isSoldOut ? "Tạm hết hàng" : "Thanh toán ngay"}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        disabled={product.isSoldOut}
                        className="w-10 h-10 rounded-full bg-paper/5 border border-paper/10 flex items-center justify-center text-paper hover:bg-paper/10 transition-all shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>


                </motion.div>
              </div>
            </div>
          </motion.div>

          {visibleSideContentOrder.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              className="w-full min-w-0 lg:flex-[0.7] lg:self-start lg:max-h-[min(760px,calc(100vh-9rem))] lg:overflow-y-auto lg:overscroll-contain scrollbar-hide bg-paper/5 backdrop-blur-3xl rounded-[1.5rem] lg:rounded-[1.75rem] p-4 lg:p-5 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col gap-5"
            >
              {visibleSideContentOrder.map((sectionId) => {
                if (sectionId === "warranty") {
                  return (
                    <div key={sectionId}>
                      <h2 className="text-base font-montserrat font-bold tracking-[0.18em] mb-4 flex items-center gap-2.5 uppercase text-paper/80">
                        <Shield className="w-4 h-4 text-[#FF8C00]" />
                        Bảo hành
                      </h2>
                      <div className="flex flex-col gap-4">
                        {warrantyItems.map((item, index) => (
                          <div key={`${item.title}-${item.desc}-${index}`} className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-paper/5 border border-paper/10 flex items-center justify-center shrink-0">
                              <item.icon className="w-3.5 h-3.5 text-[#FF8C00]" />
                            </div>
                            <div>
                              {item.title && (
                                <h3 className="font-montserrat font-bold uppercase text-[13px] mb-1 leading-tight text-paper">
                                  <RichText text={item.title} />
                                </h3>
                              )}
                              <p className="text-paper text-[13px] leading-relaxed">
                                <RichText text={item.desc} />
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sectionId === "features") {
                  return (
                    <div key={sectionId}>
                      <h2 className="text-base font-montserrat font-bold tracking-[0.18em] mb-3 uppercase text-paper/80">
                        Tính năng
                      </h2>
                      <ul className="space-y-2.5 text-[13px] text-paper">
                        {features.map((feature) => (
                          <li key={feature} className="flex gap-3">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF8C00] shrink-0" />
                            <RichText text={feature} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                if (sectionId === "instructions") {
                  return (
                    <div key={sectionId}>
                      <h2 className="text-base font-montserrat font-bold tracking-[0.18em] mb-3 flex items-center gap-2.5 uppercase text-paper/80">
                        <ShoppingBag className="w-4 h-4 text-[#FF8C00]" />
                        Cách thức mua
                      </h2>
                      <ol className="space-y-3 text-[14px] text-paper">
                        {instructions.map((instruction, index) => (
                          <li key={`${instruction}-${index}`} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-paper/5 border border-paper/10 flex items-center justify-center text-[10px] font-bold text-[#FF8C00] shrink-0">
                              {index + 1}
                            </span>
                            <RichText text={instruction} />
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                }

                return null;
              })}
            </motion.div>
          )}
        </div>

        {detailParagraphs.length > 0 && (
          <section className="mt-5 bg-paper/5 backdrop-blur-3xl rounded-[1.75rem] p-5 lg:p-7 border border-paper/10 shadow-2xl">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-[0.24em] text-[#FF8C00] mb-2">
                  Mô tả
                </p>
                <h2 className="text-xl lg:text-2xl font-montserrat font-bold tracking-[0.16em] uppercase text-paper">
                  Thông tin chi tiết
                </h2>
              </div>
              <div className="space-y-4 max-w-5xl">
                {detailParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="text-paper text-[16px] lg:text-[17px] leading-[1.8]">
                    <RichText text={paragraph} />
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-5 lg:mt-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-[0.24em] text-[#FF8C00] mb-2">
                  Gợi ý thêm
                </p>
                <h2 className="text-xl lg:text-2xl font-montserrat font-bold tracking-[0.16em] uppercase text-paper">
                  Sản phẩm liên quan
                </h2>
              </div>
              <Link
                href={`/categories/${encodeURIComponent(product.category)}`}
                className="inline-flex items-center self-start rounded-full border border-paper/10 bg-paper/5 px-4 py-2 text-[9px] font-montserrat font-bold uppercase tracking-[0.18em] text-paper/45 transition hover:bg-paper hover:text-asphalt"
              >
                Xem danh mục {product.category}
              </Link>
            </div>

            <div className="-mx-3 overflow-x-auto px-3 pb-2 scrollbar-hide sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6">
              <div className="flex gap-3 sm:gap-4">
              {relatedProducts.map((relatedProduct, index) => (
                <div key={relatedProduct.id} className="w-[72vw] max-w-[280px] shrink-0 sm:w-[260px] lg:w-[275px]">
                  <ProductCard product={relatedProduct} index={index} />
                </div>
              ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-paper/10 bg-[#1a1917]/95 p-3 shadow-[0_-18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-paper/35">
              {selectedPlan.label} / {selectedPlan.cycle}
            </p>
            <p className="text-lg font-black text-[#FF8C00]">{formatPrice(totalPrice)}₫</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.isSoldOut}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper/10 bg-paper/5 text-paper disabled:opacity-40"
            aria-label="Thêm vào giỏ"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => !product.isSoldOut && setShowPayment(true)}
            disabled={product.isSoldOut}
            className="rounded-full bg-paper px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-asphalt disabled:opacity-50"
          >
            {product.isSoldOut ? "Hết hàng" : "Thanh toán"}
          </button>
        </div>
      </div>

      <PaymentPopup
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={product}
        plan={selectedPlan}
        quantity={quantity}
        onSubmitOrder={handleSubmitOrder}
        onSubmitWalletOrder={handleSubmitWalletOrder}
      />
    </div>
  );
}
