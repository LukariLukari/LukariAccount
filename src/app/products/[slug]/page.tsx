"use client";

import { products, Product } from "@/lib/data";
import { useParams } from "next/navigation";
import { Shield, Sparkles, Zap, RefreshCcw, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import PaymentPopup from "@/components/PaymentPopup";
import Image from "next/image";

interface Plan {
  label: string;
  price: number;
  cycle: string;
}

export default function ProductDetail() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.slug) fetchProduct();
  }, [params.slug]);

  if (isLoading) return <div className="min-h-screen bg-asphalt flex items-center justify-center text-paper/20 uppercase font-bold tracking-widest">Đang tải...</div>;
  if (!product) return <div className="min-h-screen bg-asphalt flex items-center justify-center text-red-400 uppercase font-bold tracking-widest">Sản phẩm không tồn tại</div>;

  const plans: Plan[] = product.plans && Array.isArray(product.plans) && product.plans.length > 0 
    ? product.plans 
    : [
        { label: "1 Tháng", price: product.price, cycle: "tháng" },
        { label: "6 Tháng", price: Math.floor(product.price * 5.2), cycle: "6 tháng" },
        { label: "1 Năm", price: Math.floor(product.price * 9.5), cycle: "năm" },
      ];

  const selectedPlan = plans[activePlan];

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  const handleAddToCart = () => {
    addToCart({...product, price: selectedPlan.price}, quantity);
  };

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-montserrat font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* LEFT CARD: Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-[2.5] bg-paper/5 backdrop-blur-3xl rounded-[3rem] p-6 lg:p-14 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col justify-center"
          >
            {/* Background Large Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[12vw] font-montserrat font-bold tracking-tighter leading-none whitespace-nowrap uppercase italic text-paper opacity-[0.02]">
                {product.name.replace(/\s+/g, '')}
              </span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center h-full">
              {/* Product Image Card */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-1/2 h-[280px] relative rounded-[2.5rem] overflow-hidden shadow-2xl group shrink-0 border border-paper/10"
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
                  <div className="w-full h-full bg-paper/5 flex items-center justify-center text-paper/10 text-6xl font-bold">AI</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-asphalt/40 to-transparent pointer-events-none" />
              </motion.div>

              {/* Text Info */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 bg-paper text-asphalt text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] rounded-full mb-4">
                    {product.category}
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-montserrat font-bold tracking-tight mb-2 leading-tight text-paper uppercase">
                    {product.name}
                  </h1>
                  
                  {/* Variants / Plans Selector */}
                  <div className="mb-6">
                    <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-4">Chọn gói sản phẩm</p>
                    <div className="flex flex-wrap gap-3">
                      {plans.map((plan: Plan, idx: number) => (
                        <button
                          key={plan.label}
                          onClick={() => setActivePlan(idx)}
                          className={`px-6 py-2.5 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
                            activePlan === idx 
                              ? "!text-[#302f2c] !bg-[#efede3] shadow-xl" 
                              : "text-paper/40 bg-paper/5 border-paper/10 hover:border-paper/30"
                          } border`}
                        >
                          {plan.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-6">
                    {activePlan === 0 && product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm font-montserrat font-medium text-paper/30 line-through decoration-red-500/50">
                        {formatPrice(product.originalPrice)}₫
                      </span>
                    )}
                    <div className="text-3xl font-montserrat font-bold text-paper flex items-baseline gap-2">
                      <span className="text-[#FF8C00] drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                        {formatPrice(selectedPlan.price)}₫
                      </span>
                      <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">/ {selectedPlan.cycle}</span>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30">Số lượng</p>
                      <div className="flex items-center bg-paper/5 rounded-full p-1 border border-paper/10">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-montserrat font-bold text-sm text-paper">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper/10 transition-all font-bold text-paper"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      {/* Buy Now */}
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBuyNow}
                        className="flex-1 px-8 py-4 rounded-full !bg-[#efede3] !text-[#302f2c] font-montserrat font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                      >
                        Thanh toán ngay
                      </motion.button>

                      {/* Add to Cart */}
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

          {/* RIGHT CARD: Warranty & Protection */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 bg-paper/5 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col"
          >
            {/* Background Large Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
              <span className="text-[8vw] font-montserrat font-bold tracking-tighter leading-none whitespace-nowrap uppercase italic rotate-90 text-paper opacity-[0.02] block">
                PROTECTION
              </span>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h2 className="text-xl font-montserrat font-bold tracking-[0.2em] mb-10 flex items-center gap-3 uppercase text-paper/80">
                  <Shield className="w-5 h-5 text-[#FF8C00]" />
                  Bảo hành
                </h2>

                <div className="flex flex-col gap-6">
                  {[
                    { icon: Zap, title: "Kích hoạt tức thì", desc: "Kích hoạt ngay sau thanh toán." },
                    { icon: RefreshCcw, title: "Lỗi 1 đổi 1", desc: "Đổi mới ngay lập tức nếu lỗi." },
                    { icon: Shield, title: "Bảo hành trọn đời", desc: "Hỗ trợ suốt thời gian sử dụng." },
                    { icon: Sparkles, title: "Hỗ trợ 24/7", desc: "Chuyên viên hỗ trợ 24/7." }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (idx * 0.1) }}
                      className="flex gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-paper/5 flex items-center justify-center shrink-0 group-hover:bg-paper group-hover:text-asphalt transition-all duration-300 border border-paper/10 text-paper/60">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-montserrat font-bold text-[11px] uppercase tracking-widest text-paper mb-1">{item.title}</h3>
                        <p className="text-[10px] text-paper/40 font-bold leading-tight">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-5 bg-paper/5 rounded-2xl border border-paper/10 text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30">
                Giao dịch bảo mật & an toàn.
              </div>
            </div>
          </motion.div>

        </div>

        {/* DETAILED DESCRIPTION SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-8 border-b border-paper/10 pb-6 uppercase tracking-[0.2em] text-paper">
            Chi tiết sản phẩm
          </h2>
          <div className="prose prose-invert max-w-none text-paper/60 font-bold leading-relaxed space-y-12">
            {product.details && (
              <div className="whitespace-pre-wrap text-lg text-paper/80 bg-paper/[0.02] p-8 rounded-[2rem] border border-paper/5">
                {product.details}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Features List */}
              {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                <div className="bg-paper/5 p-10 rounded-[2.5rem] border border-paper/10 shadow-xl">
                  <h3 className="font-montserrat font-bold text-sm mb-6 uppercase tracking-widest text-paper flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF8C00]" />
                    Tính năng nổi bật
                  </h3>
                  <ul className="space-y-4 text-[11px] font-montserrat font-bold uppercase tracking-wider text-paper/40">
                    {(product.features as string[]).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] shadow-[0_0_10px_#FF8C00]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Usage Instructions */}
              {product.instructions && Array.isArray(product.instructions) && product.instructions.length > 0 && (
                <div className="bg-paper/5 p-10 rounded-[2.5rem] border border-paper/10 shadow-xl">
                  <h3 className="font-montserrat font-bold text-sm mb-6 uppercase tracking-widest text-paper flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF8C00]" />
                    Hướng dẫn sử dụng
                  </h3>
                  <div className="space-y-6">
                    {(product.instructions as string[]).map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="text-[10px] font-black text-[#FF8C00] mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-[10px] text-paper/50 font-bold leading-relaxed uppercase tracking-wide">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Warranty Policy Display */}
            {product.warranty && (
              <div className="bg-paper/5 p-10 rounded-[2.5rem] border border-paper/10 shadow-xl">
                <h3 className="font-montserrat font-bold text-sm mb-4 uppercase tracking-widest text-paper flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FF8C00]" />
                  Chính sách bảo hành
                </h3>
                <p className="text-xs text-paper/50 font-bold leading-relaxed whitespace-pre-wrap">
                  {product.warranty}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Payment Popup */}
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
