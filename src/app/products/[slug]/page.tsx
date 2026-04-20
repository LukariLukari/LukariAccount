"use client";

import Navbar from "@/components/Navbar";
import { products } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Shield, Sparkles, Zap, RefreshCcw, ArrowLeft } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(0);
  const [quantity, setQuantity] = React.useState(1);

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

  const plans = product.plans && Array.isArray(product.plans) && product.plans.length > 0 
    ? product.plans 
    : [
        { label: "1 Tháng", price: product.price, cycle: "tháng" },
        { label: "6 Tháng", price: Math.floor(product.price * 5.2), cycle: "6 tháng" },
        { label: "1 Năm", price: Math.floor(product.price * 9.5), cycle: "năm" },
      ];

  const selectedPlan = plans[activePlan];

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-6 pt-8 pb-12 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-montserrat font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[550px]">
          
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
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                  <h1 className="text-5xl font-montserrat font-bold tracking-tight mb-2 leading-tight text-paper uppercase">
                    {product.name}
                  </h1>
                  
                  {/* Variants / Plans Selector */}
                  <div className="mb-8">
                    <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-4">Chọn gói sản phẩm</p>
                    <div className="flex flex-wrap gap-3">
                      {plans.map((plan, idx) => (
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

                  <div className="text-3xl font-montserrat font-bold text-paper mb-8 flex items-baseline gap-2">
                    <span className="text-[#FF8C00] drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                      {plans[activePlan]?.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">/ {plans[activePlan]?.cycle}</span>
                  </div>
                  
                  {/* Quantity & Actions */}
                  <div className="flex flex-col gap-6">
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

                    <div className="w-full">
                      <AddToCartButton 
                        product={{...product, price: plans.find(p => p.cycle === selectedPlan)?.price || product.price}} 
                        quantity={quantity}
                      />
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
            className="flex-1 bg-paper/5 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl border border-paper/10 flex flex-col min-h-[500px]"
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
          className="mt-24 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-8 border-b border-paper/10 pb-6 uppercase tracking-[0.2em] text-paper">
            Mô tả chi tiết
          </h2>
          <div className="prose prose-invert max-w-none text-paper/60 font-bold leading-relaxed space-y-8">
            <p className="text-lg">
              {product.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-paper/5 p-10 rounded-[2.5rem] border border-paper/10 shadow-xl">
                <h3 className="font-montserrat font-bold text-sm mb-6 uppercase tracking-widest text-paper">Tính năng nổi bật</h3>
                <ul className="space-y-4 text-[11px] font-montserrat font-bold uppercase tracking-wider text-paper/40">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                    Sử dụng không giới hạn model mới
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                    Tốc độ xử lý ưu tiên
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                    Truy cập sớm tính năng mới
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                    Bảo mật dữ liệu tuyệt đối
                  </li>
                </ul>
              </div>
              <div className="bg-paper/5 p-10 rounded-[2.5rem] border border-paper/10 shadow-xl flex flex-col justify-center">
                <h3 className="font-montserrat font-bold text-sm mb-4 uppercase tracking-widest text-paper">Hướng dẫn sử dụng</h3>
                <p className="text-xs text-paper/50 font-bold leading-relaxed">
                  Sau khi thanh toán, bạn sẽ nhận được thông tin kích hoạt qua email. Chỉ cần đăng nhập và bắt đầu trải nghiệm sức mạnh của AI ngay lập tức.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
