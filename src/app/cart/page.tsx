"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-montserrat">
      <Navbar />
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl font-bold mb-12 tracking-tighter text-black">Giỏ hàng của bạn</h1>

          {cart.length === 0 ? (
            <div className="text-center py-24 bg-white border border-black/5 rounded-[3rem] shadow-sm">
              <ShoppingBag className="w-16 h-16 mx-auto text-black/10 mb-6" />
              <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
              <p className="text-black/40 mb-10 font-medium">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ.</p>
              <Link 
                href="/products" 
                className="px-10 py-4 bg-black text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#FF8C00] transition-all duration-500 shadow-xl shadow-black/10"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Cart Items */}
              <div className="flex-1 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-black/5 rounded-[2.5rem] shadow-sm">
                    <div className="w-24 h-24 shrink-0 bg-[#F5F5F7] rounded-2xl flex items-center justify-center overflow-hidden border border-black/5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-black/10 font-black uppercase">AI</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-xl mb-1">{item.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#F5F5F7] rounded-full p-1 border border-black/5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-all font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-bold text-xl w-32 text-right">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={clearCart}
                  className="text-xs font-bold uppercase tracking-widest text-black/20 hover:text-red-500 transition-colors ml-4"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white border border-black/5 rounded-[3rem] p-10 sticky top-24 shadow-sm">
                  <h3 className="font-bold text-2xl mb-8 border-b border-black/5 pb-6">Tổng quan</h3>
                  
                  <div className="flex justify-between mb-5 text-black/40 font-bold text-sm">
                    <span>Tạm tính</span>
                    <span>{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-black/40 font-bold text-sm">
                    <span>Giảm giá</span>
                    <span>0₫</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-2xl border-t border-black/5 pt-6 mb-10">
                    <span>Tổng cộng</span>
                    <span className="text-[#FF8C00]">{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>

                  <button className="w-full py-5 bg-black text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ color: '#FFFFFF' }}>
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
