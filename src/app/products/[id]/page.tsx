"use client";

import Navbar from "@/components/Navbar";
import { products } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Shield, Sparkles, Zap, RefreshCcw, ArrowLeft } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    notFound();
    return null;
  }

  const [quantity, setQuantity] = React.useState(1);
  const [selectedPlan, setSelectedPlan] = React.useState(product.billingCycle);

  const plans = [
    { label: "1 Tháng", cycle: "tháng", price: product.price * 0.8 },
    { label: "12 Tháng", cycle: "12 tháng", price: product.price },
    { label: "Vĩnh viễn", cycle: "vĩnh viễn", price: product.price * 5 }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-6 pt-8 pb-12 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium opacity-40 hover:opacity-100 transition-opacity mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[550px]">
          
          {/* LEFT CARD: Product Info (Increased size) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-[2.5] bg-white rounded-[3rem] p-6 lg:p-14 relative overflow-hidden shadow-sm flex flex-col justify-center"
          >
            {/* Background Large Text - Product Name */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[12vw] font-akina font-black tracking-tighter leading-none whitespace-nowrap uppercase italic text-black opacity-[0.03]">
                {product.name.replace(/\s+/g, '')}
              </span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center h-full">
              {/* Product Image Card - Compact Banner Style */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-1/2 h-[280px] relative rounded-[2rem] overflow-hidden shadow-2xl group shrink-0"
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center text-black/5 text-6xl font-black">AI</div>
                )}
                {/* Subtle overlay for the image in detail view */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </motion.div>

              {/* Text Info */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-full mb-4">
                    {product.category}
                  </span>
                  <h1 className="text-5xl font-akina font-black tracking-tight mb-2 leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Variants / Plans Selector */}
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-3">Chọn gói sản phẩm</p>
                    <div className="flex flex-wrap gap-3">
                      {plans.map((plan) => (
                        <button
                          key={plan.label}
                          onClick={() => setSelectedPlan(plan.cycle)}
                          className={`px-6 py-2.5 rounded-full text-[11px] font-akina font-bold transition-all duration-300 relative overflow-hidden ${
                            selectedPlan === plan.cycle 
                              ? "text-black bg-white/40 shadow-sm border-black" 
                              : "text-black/30 bg-transparent border-black/5 hover:border-black/20"
                          } border`}
                        >
                          {selectedPlan === plan.cycle && (
                            <motion.div 
                              layoutId="planBlur"
                              className="absolute inset-0 bg-white/20 backdrop-blur-md z-[-1]"
                            />
                          )}
                          {plan.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-2xl font-akina font-bold opacity-40 mb-8 flex items-baseline gap-2">
                    {plans.find(p => p.cycle === selectedPlan)?.price.toLocaleString('vi-VN')}₫
                    <span className="text-xs font-medium uppercase">/ {selectedPlan}</span>
                  </div>
                  
                  {/* Quantity & Actions */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Số lượng</p>
                      <div className="flex items-center bg-[#F5F5F7] rounded-full p-1 border border-black/5">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
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

          {/* RIGHT CARD: Warranty & Protection (Decreased size) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 bg-white rounded-[3rem] p-8 lg:p-10 relative overflow-hidden shadow-sm flex flex-col min-h-[500px]"
          >
            {/* Background Large Text - Product Name */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
              <span className="text-[8vw] font-akina font-black tracking-tighter leading-none whitespace-nowrap uppercase italic rotate-90 text-black opacity-[0.03] block">
                {product.name.replace(/\s+/g, '')}
              </span>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl font-sans font-black tracking-tight mb-10 flex items-center gap-3">
                  <Shield className="w-6 h-6" />
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
                      className="flex gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                        <p className="text-[10px] opacity-50 leading-tight">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#F5F5F7] rounded-2xl border border-black/5 text-[10px] font-medium opacity-60">
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
          <h2 className="text-3xl font-sans font-black mb-8 border-b border-black/5 pb-4">
            Mô tả chi tiết
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed opacity-70 space-y-6">
            <p>
              {product.description}
            </p>
            <p>
              Sản phẩm này được cung cấp chính hãng với đầy đủ các tính năng cao cấp nhất. Chúng tôi cam kết mang lại trải nghiệm tốt nhất cho người dùng với sự hỗ trợ tận tình và các gói cập nhật định kỳ.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="font-bold text-xl mb-4">Tính năng nổi bật</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Sử dụng không giới hạn các model mới nhất.</li>
                  <li>Tốc độ xử lý ưu tiên, không bị gián đoạn.</li>
                  <li>Truy cập sớm vào các tính năng thử nghiệm.</li>
                  <li>Bảo mật dữ liệu tuyệt đối theo tiêu chuẩn quốc tế.</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="font-bold text-xl mb-4">Hướng dẫn sử dụng</h3>
                <p className="text-sm">
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
