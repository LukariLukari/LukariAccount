<<<<<<< Updated upstream
"use client";

import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";
import PaymentPopup from "@/components/PaymentPopup";
import type { Product } from "@/lib/data";

interface CheckoutSummary {
  subtotal: number;
  discountAmount: number;
  total: number;
  coupon?: {
    code: string;
    discountPercent: number;
  } | null;
  order?: {
    orderCode: string;
  } | null;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const payableTotal = checkoutSummary?.total ?? cartTotal;
  const discountAmount = checkoutSummary?.discountAmount ?? 0;

  const checkoutProduct = useMemo<Product>(() => ({
    id: "cart",
    slug: "cart",
    name: `Đơn hàng ${cart.length} sản phẩm`,
    description: cart.map((item) => `${item.name} x${item.quantity}`).join(", "),
    price: payableTotal,
    billingCycle: "đơn hàng",
    rating: 5,
    downloads: "0+",
    image: cart[0]?.image || "",
    category: "Cart",
  }), [cart, payableTotal]);

  const requestCheckout = async (createOrder: boolean, note = "") => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createOrder,
        couponCode,
        note,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể xử lý đơn hàng");
    }
    return data as CheckoutSummary;
  };

  const handleApplyCoupon = async () => {
    setCheckoutError("");
    if (!couponCode.trim()) {
      setCheckoutSummary(null);
      return;
    }

    try {
      const summary = await requestCheckout(false);
      setCheckoutSummary(summary);
    } catch (error) {
      setCheckoutSummary(null);
      setCheckoutError(error instanceof Error ? error.message : "Mã giảm giá không hợp lệ");
    }
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const summary = await requestCheckout(false);
      setCheckoutSummary(summary);
      setShowPayment(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Không thể tạo đơn hàng");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt text-paper font-montserrat selection:bg-paper selection:text-asphalt">
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-8 md:mb-12 tracking-tighter text-paper uppercase">Giỏ hàng của bạn</h1>

          {cart.length === 0 ? (
            <div 
              className="text-center py-20 md:py-24 bg-paper/5 border border-paper/10 rounded-[2rem] md:rounded-[3rem] shadow-2xl backdrop-blur-xl"
              suppressHydrationWarning
            >
              <ShoppingBag className="w-16 h-16 mx-auto text-paper/10 mb-6" />
              <h2 className="text-2xl font-montserrat font-bold mb-4">Giỏ hàng trống</h2>
              <p className="text-paper/40 mb-10 font-bold font-montserrat text-[10px] uppercase tracking-widest">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ.</p>
              <Link 
                href="/products" 
                className="px-10 py-4 bg-paper text-[#302f2c] rounded-full font-montserrat font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-2xl"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="flex-1 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 p-4 md:p-6 bg-paper/5 border border-paper/10 rounded-[1.75rem] md:rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                    <div className="w-24 h-24 shrink-0 bg-asphalt rounded-2xl flex items-center justify-center overflow-hidden border border-paper/10">
                      {item.image ? (
                        <div className="relative w-full h-full">
                          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-paper/10 font-montserrat font-bold uppercase">AI</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-montserrat font-bold text-xl mb-1 text-paper uppercase">{item.name}</h3>
                      <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-paper/10 rounded-full p-1 border border-paper/10 text-paper">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-montserrat font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-montserrat font-bold text-xl w-32 text-right text-paper">
                      {formatPrice(item.price * item.quantity)}₫
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-paper/20 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={clearCart}
                  className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/20 hover:text-red-400 transition-colors ml-4"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-paper/5 border border-paper/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 sticky top-32 shadow-2xl backdrop-blur-xl">
                  <h3 className="font-montserrat font-bold text-xl mb-8 border-b border-paper/10 pb-6 uppercase tracking-wider">Tổng quan</h3>
                  
                  <div className="flex justify-between mb-5 text-paper/40 font-montserrat font-bold text-[10px] uppercase tracking-widest">
                    <span>Tạm tính</span>
                    <span>{formatPrice(cartTotal)}₫</span>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-paper/40 font-montserrat font-bold text-[10px] uppercase tracking-widest">
                    <span>Giảm giá</span>
                    <span>{formatPrice(discountAmount)}₫</span>
                  </div>

                  <div className="mb-8 space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCheckoutSummary(null);
                          setCheckoutError("");
                        }}
                        placeholder="Mã giảm giá"
                        className="min-w-0 flex-1 rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-paper outline-none placeholder:text-paper/20 focus:border-paper/30"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="rounded-2xl border border-paper/10 bg-paper/10 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-paper/60 transition hover:bg-paper hover:text-asphalt"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {checkoutSummary?.coupon && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-green-400">
                        Đã áp dụng {checkoutSummary.coupon.code} -{checkoutSummary.coupon.discountPercent}%
                      </p>
                    )}
                    {checkoutError && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">
                        {checkoutError}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between font-montserrat font-bold text-2xl border-t border-paper/10 pt-6 mb-10 text-paper">
                    <span>Tổng cộng</span>
                    <span className="text-[#FF8C00] drop-shadow-[0_2px_4px_rgba(255,140,0,0.2)]">{formatPrice(payableTotal)}₫</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-5 !bg-[#efede3] !text-[#302f2c] rounded-full font-akina font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#efede3', color: '#302f2c' }}
                  >
                    {isCheckingOut ? "Đang kiểm tra..." : "Thanh toán ngay"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {cart.length > 0 && (
        <PaymentPopup
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          product={checkoutProduct}
          plan={{
            label: "Giỏ hàng",
            price: payableTotal,
            cycle: "đơn hàng",
          }}
          quantity={1}
          lineItems={cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))}
          onSubmitOrder={async (note) => {
            const summary = await requestCheckout(true, note);
            setCheckoutSummary(summary);
            return { orderCode: summary.order?.orderCode };
          }}
        />
      )}
    </div>
  );
}
=======
"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-asphalt text-paper font-montserrat selection:bg-paper selection:text-asphalt">
      <Navbar />
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl font-montserrat font-bold mb-12 tracking-tighter text-paper uppercase">Giỏ hàng của bạn</h1>

          {cart.length === 0 ? (
            <div className="text-center py-24 bg-paper/5 border border-paper/10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
              <ShoppingBag className="w-16 h-16 mx-auto text-paper/10 mb-6" />
              <h2 className="text-2xl font-montserrat font-bold mb-4">Giỏ hàng trống</h2>
              <p className="text-paper/40 mb-10 font-bold font-montserrat text-[10px] uppercase tracking-widest">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ.</p>
              <Link 
                href="/products" 
                className="px-10 py-4 bg-paper text-[#302f2c] rounded-full font-montserrat font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-2xl"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Cart Items */}
              <div className="flex-1 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-paper/5 border border-paper/10 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                    <div className="w-24 h-24 shrink-0 bg-asphalt rounded-2xl flex items-center justify-center overflow-hidden border border-paper/10">
                      {item.image ? (
                        <div className="relative w-full h-full">
                          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-paper/10 font-montserrat font-bold uppercase">AI</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-montserrat font-bold text-xl mb-1 text-paper uppercase">{item.name}</h3>
                      <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-paper/10 rounded-full p-1 border border-paper/10 text-paper">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-montserrat font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-montserrat font-bold text-xl w-32 text-right text-paper">
                      {formatPrice(item.price * item.quantity)}₫
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-paper/20 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={clearCart}
                  className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/20 hover:text-red-400 transition-colors ml-4"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-paper/5 border border-paper/10 rounded-[3rem] p-10 sticky top-32 shadow-2xl backdrop-blur-xl">
                  <h3 className="font-montserrat font-bold text-xl mb-8 border-b border-paper/10 pb-6 uppercase tracking-wider">Tổng quan</h3>
                  
                  <div className="flex justify-between mb-5 text-paper/40 font-montserrat font-bold text-[10px] uppercase tracking-widest">
                    <span>Tạm tính</span>
                    <span>{formatPrice(cartTotal)}₫</span>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-paper/40 font-montserrat font-bold text-[10px] uppercase tracking-widest">
                    <span>Giảm giá</span>
                    <span>0₫</span>
                  </div>
                  
                  <div className="flex justify-between font-montserrat font-bold text-2xl border-t border-paper/10 pt-6 mb-10 text-paper">
                    <span>Tổng cộng</span>
                    <span className="text-[#FF8C00] drop-shadow-[0_2px_4px_rgba(255,140,0,0.2)]">{formatPrice(cartTotal)}₫</span>
                  </div>

                  <button 
                    className="w-full py-5 !bg-[#efede3] !text-[#302f2c] rounded-full font-akina font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    style={{ backgroundColor: '#efede3', color: '#302f2c' }}
                  >
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
>>>>>>> Stashed changes
