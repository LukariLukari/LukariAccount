"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-asphalt text-paper font-montserrat selection:bg-paper selection:text-asphalt">
      <Navbar />
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl font-akina font-black mb-12 tracking-tighter text-paper uppercase">Giỏ hàng của bạn</h1>

          {cart.length === 0 ? (
            <div className="text-center py-24 bg-paper/5 border border-paper/10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
              <ShoppingBag className="w-16 h-16 mx-auto text-paper/10 mb-6" />
              <h2 className="text-2xl font-akina font-bold mb-4">Giỏ hàng trống</h2>
              <p className="text-paper/40 mb-10 font-medium font-akina text-[10px] uppercase tracking-widest">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ.</p>
              <Link 
                href="/products" 
                className="px-10 py-4 bg-paper text-[#302f2c] rounded-full font-akina font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-2xl"
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
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-paper/10 font-akina font-black uppercase">AI</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-akina font-bold text-xl mb-1 text-paper">{item.name}</h3>
                      <p className="text-[10px] font-akina font-bold uppercase tracking-widest text-paper/30">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-paper/10 rounded-full p-1 border border-paper/10 text-paper">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-akina font-black">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper/20 transition-all font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-akina font-black text-xl w-32 text-right text-paper">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
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
                  className="text-[9px] font-akina font-black uppercase tracking-[0.2em] text-paper/20 hover:text-red-400 transition-colors ml-4"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-paper/5 border border-paper/10 rounded-[3rem] p-10 sticky top-32 shadow-2xl backdrop-blur-xl">
                  <h3 className="font-akina font-black text-xl mb-8 border-b border-paper/10 pb-6 uppercase tracking-wider">Tổng quan</h3>
                  
                  <div className="flex justify-between mb-5 text-paper/40 font-akina font-bold text-[10px] uppercase tracking-widest">
                    <span>Tạm tính</span>
                    <span>{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-paper/40 font-akina font-bold text-[10px] uppercase tracking-widest">
                    <span>Giảm giá</span>
                    <span>0₫</span>
                  </div>
                  
                  <div className="flex justify-between font-akina font-black text-2xl border-t border-paper/10 pt-6 mb-10 text-paper">
                    <span>Tổng cộng</span>
                    <span className="text-[#FF8C00] drop-shadow-[0_2px_4px_rgba(255,140,0,0.2)]">{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>

                  <button className="w-full py-5 bg-paper text-[#302f2c] rounded-full font-akina font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
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
