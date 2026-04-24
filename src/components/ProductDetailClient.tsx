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

interface Plan {
  type?: string;
  label: string;
  price: number;
  cycle: string;
}

interface ProductDetailClientProps {
  product: Product;
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
  const features =
    Array.isArray(product.features) && product.features.length > 0
      ? (product.features as string[])
      : [
          "Kích hoạt nhanh sau khi xác nhận thanh toán",
          "Hỗ trợ trong suốt thời gian sử dụng",
          "Bảo hành theo đúng chính sách của từng gói",
        ];
  const instructions =
    Array.isArray(product.instructions) && product.instructions.length > 0
      ? (product.instructions as string[])
      : ["Liên hệ sau thanh toán để nhận thông tin kích hoạt."];

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setActivePlanIdx(0);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, price: selectedPlan.price }, quantity);
  };

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="max-w-[1320px] mx-auto px-5 lg:px-6 py-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-montserrat font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-[2.15] bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] p-5 lg:p-9 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col justify-center"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[10vw] font-montserrat font-bold tracking-tighter leading-none whitespace-nowrap uppercase italic text-paper opacity-[0.02]">
                {product.name.replace(/\s+/g, "")}
              </span>
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:gap-7 h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                className="w-full h-[320px] lg:h-[360px] relative rounded-[2rem] overflow-hidden shadow-2xl group shrink-0 border border-paper/10"
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
                    className="text-[2rem] lg:text-[2.75rem] font-montserrat font-bold tracking-tight mb-3 leading-none text-paper uppercase whitespace-nowrap truncate max-w-full"
                    title={product.name}
                  >
                    {product.name}
                  </h1>
                  <p className="text-paper/60 text-[15px] leading-relaxed mb-5 max-w-[42rem]">
                    {product.description || "Giải pháp phù hợp cho nhu cầu sử dụng lâu dài và ổn định."}
                  </p>

                  <div className="mb-5 space-y-4">
                    {types.length > 1 && (
                      <div>
                        <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-3">
                          Phân loại gói
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {types.map((type) => (
                            <button
                              key={type}
                              onClick={() => handleTypeChange(type)}
                              className={`px-6 py-2.5 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
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
                      <div className="flex flex-wrap gap-3">
                        {filteredPlans.map((plan, idx) => (
                          <button
                            key={`${plan.label}-${idx}`}
                            onClick={() => setActivePlanIdx(idx)}
                            className={`px-6 py-2.5 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
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

                  <div className="flex flex-col gap-1 mb-5">
                    {activePlanIdx === 0 &&
                      product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-sm font-montserrat font-medium text-paper/30 line-through decoration-red-500/50">
                          {formatPrice(product.originalPrice)}₫
                        </span>
                      )}
                    <div className="text-[2rem] lg:text-[2.5rem] font-montserrat font-bold text-paper flex items-baseline gap-2">
                      <span className="text-[#FF8C00] drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                        {formatPrice(selectedPlan.price)}₫
                      </span>
                      <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">
                        / {selectedPlan.cycle}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30">
                          Số lượng
                        </p>
                        <div className="flex items-center bg-paper/5 rounded-full p-1 border border-paper/10">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-montserrat font-bold text-sm text-paper">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto lg:min-w-[420px]">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPayment(true)}
                        className="flex-1 px-7 py-3.5 rounded-full !bg-[#efede3] !text-[#302f2c] font-montserrat font-bold text-[11px] uppercase tracking-[0.18em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                      >
                        Thanh toán ngay
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className="w-14 h-14 rounded-full bg-paper/5 border border-paper/10 flex items-center justify-center text-paper hover:bg-paper/10 transition-all shrink-0"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            className="flex-[0.95] bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col gap-7"
          >
            <div>
              <h2 className="text-lg lg:text-xl font-montserrat font-bold tracking-[0.18em] mb-5 flex items-center gap-3 uppercase text-paper/80">
                <Shield className="w-5 h-5 text-[#FF8C00]" />
                Bảo hành
              </h2>
              <div className="flex flex-col gap-5">
                {[
                  { icon: Zap, title: "Kích hoạt tức thì", desc: "Kích hoạt sau khi đối soát thanh toán." },
                  { icon: RefreshCcw, title: "Lỗi 1 đổi 1", desc: "Hỗ trợ đổi nếu lỗi từ phía tài khoản hoặc key." },
                  { icon: Shield, title: "Bảo hành rõ ràng", desc: product.warranty || "Áp dụng theo thời hạn và điều kiện của từng gói." },
                  { icon: Sparkles, title: "Hỗ trợ 24/7", desc: "Ưu tiên hỗ trợ nhanh qua kênh liên hệ chính." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-[1.1rem] bg-paper/5 border border-paper/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-[#FF8C00]" />
                    </div>
                    <div>
                      <h3 className="font-montserrat font-bold uppercase text-[15px] mb-1 leading-tight">{item.title}</h3>
                      <p className="text-paper/50 text-[15px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg lg:text-xl font-montserrat font-bold tracking-[0.18em] mb-4 uppercase text-paper/80">
                Tính năng
              </h2>
              <ul className="space-y-3 text-[15px] text-paper/60">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF8C00] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg lg:text-xl font-montserrat font-bold tracking-[0.18em] mb-4 uppercase text-paper/80">
                Hướng dẫn
              </h2>
              <ol className="space-y-3 text-[15px] text-paper/60">
                {instructions.map((instruction, index) => (
                  <li key={`${instruction}-${index}`} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-paper/5 border border-paper/10 flex items-center justify-center text-[10px] font-bold text-[#FF8C00] shrink-0">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>

        {product.details && (
          <section className="mt-7 bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] p-6 lg:p-8 border border-paper/10 shadow-2xl">
            <h2 className="text-lg lg:text-xl font-montserrat font-bold tracking-[0.18em] mb-4 uppercase text-paper/80">
              Thông tin chi tiết
            </h2>
            <p className="text-paper/60 text-[15px] leading-relaxed whitespace-pre-line">{product.details}</p>
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
