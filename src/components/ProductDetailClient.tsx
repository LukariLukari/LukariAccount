"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RefreshCcw,
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
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getProductPlans(product: Product): Plan[] {
  if (product.plans && Array.isArray(product.plans) && product.plans.length > 0) {
    return product.plans as Plan[];
  }

  return [
    { type: "Mặc định", label: "1 Tháng", price: product.price, cycle: "tháng" },
    { type: "Mặc định", label: "6 Tháng", price: Math.floor(product.price * 5.2), cycle: "6 tháng" },
    { type: "Mặc định", label: "1 Năm", price: Math.floor(product.price * 9.5), cycle: "năm" },
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

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
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
    addToCart({ ...product, price: selectedPlan.price }, quantity);
  };

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="w-full max-w-[1180px] mx-auto px-3 sm:px-5 lg:px-6 py-4 lg:py-5 overflow-x-hidden">
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
                  <span className="inline-block px-3 py-1 bg-paper text-asphalt text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] rounded-full mb-4">
                    {product.category}
                  </span>
                  <h1
                    className="text-[1.25rem] sm:text-[1.35rem] lg:text-[1.75rem] font-montserrat font-bold tracking-tight mb-2 leading-none text-paper uppercase truncate max-w-full"
                    title={product.name}
                  >
                    {product.name}
                  </h1>
                  <p className="text-paper text-[13px] leading-relaxed mb-4 max-w-[36rem]">
                    <RichText text={product.description || "Giải pháp phù hợp cho nhu cầu sử dụng lâu dài và ổn định."} />
                  </p>

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
                      <div className="flex flex-wrap gap-2">
                        {filteredPlans.map((plan, idx) => (
                          <button
                            key={`${plan.label}-${idx}`}
                            onClick={() => setActivePlanIdx(idx)}
                            className={`px-4 py-2 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
                              activePlanIdx === idx
                                ? "!text-[#302f2c] !bg-[#efede3] shadow-xl"
                                : "text-paper/40 bg-paper/5 border-paper/10 hover:border-paper/30"
                            } border`}
                          >
                            {plan.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4 xl:items-end">
                    <div className="flex flex-col gap-1">
                      {activePlanIdx === 0 &&
                        product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="text-sm font-montserrat font-medium text-paper/30 line-through decoration-red-500/50">
                            {formatPrice(product.originalPrice)}₫
                          </span>
                        )}
                      <div className="text-[1.75rem] lg:text-[2rem] font-montserrat font-bold text-paper flex items-baseline gap-2">
                        <span className="text-[#FF8C00] drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                          {formatPrice(selectedPlan.price)}₫
                        </span>
                        <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">
                          / {selectedPlan.cycle}
                        </span>
                      </div>
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
                        onClick={() => setShowPayment(true)}
                        className="flex-1 sm:flex-none min-w-[210px] px-4 sm:px-5 py-2.5 rounded-full !bg-[#efede3] !text-[#302f2c] font-montserrat font-bold text-[9px] uppercase tracking-[0.16em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                      >
                        Thanh toán ngay
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className="w-10 h-10 rounded-full bg-paper/5 border border-paper/10 flex items-center justify-center text-paper hover:bg-paper/10 transition-all shrink-0"
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
              className="w-full min-w-0 lg:flex-[0.7] bg-paper/5 backdrop-blur-3xl rounded-[1.5rem] lg:rounded-[1.75rem] p-4 lg:p-5 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col gap-5"
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
      </main>

      <PaymentPopup
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={product}
        plan={selectedPlan}
        quantity={quantity}
      />
    </div>
  );
}
