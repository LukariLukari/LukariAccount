"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 bg-secondary border border-border rounded-lg shadow-sm">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-8">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ.</p>
              <Link 
                href="/products" 
                className="px-6 py-3 bg-cta hover:bg-cta/90 text-white rounded-md font-medium"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-secondary border border-border rounded-lg shadow-sm">
                    <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-md p-2 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">No Img</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border bg-slate-50 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border bg-slate-50 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-bold text-lg w-32 text-right">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:underline mt-4"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="bg-secondary border border-border rounded-lg p-6 sticky top-24 shadow-sm">
                  <h3 className="font-bold text-xl mb-6 border-b border-border pb-4">Tổng quan đơn hàng</h3>
                  
                  <div className="flex justify-between mb-4 text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  
                  <div className="flex justify-between mb-6 text-muted-foreground">
                    <span>Giảm giá</span>
                    <span>0₫</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-xl border-t border-border pt-4 mb-8">
                    <span>Tổng cộng</span>
                    <span className="text-cta">{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>

                  <button className="w-full py-4 bg-cta hover:bg-cta/90 text-white rounded-md font-semibold text-lg shadow-glow transition-all active:scale-95">
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
