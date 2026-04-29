"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Eye,
  X,
  CreditCard
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "@prisma/client";

interface OrderItem {
  id: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  customerNote: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ isOpen: true, title, message, onConfirm });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (searchQuery) query.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when search query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteOrder = (orderId: string, orderCode: string) => {
    showConfirm("Xác nhận xóa đơn hàng", `Bạn có chắc chắn muốn xóa đơn hàng ${orderCode}? Hành động này không thể hoàn tác.`, async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
        if (res.ok) {
          setOrders(orders.filter(o => o.id !== orderId));
          if (selectedOrder?.id === orderId) setSelectedOrder(null);
        }
      } catch (error) {
        console.error("Failed to delete order", error);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-500"><Clock className="w-3 h-3" /> Chờ xử lý</span>;
      case "PAID":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400"><CreditCard className="w-3 h-3" /> Đã thanh toán</span>;
      case "FULFILLED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" /> Đã hoàn thành</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-red-500/20 text-red-400"><AlertCircle className="w-3 h-3" /> Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-paper/10 text-paper/60">{status}</span>;
    }
  };

  return (
    <div className="space-y-10 relative">
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý Đơn hàng</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            {orders.length} đơn hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-paper/5 backdrop-blur-3xl p-4 rounded-3xl border border-paper/10">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING", label: "Chờ xử lý" },
            { id: "PAID", label: "Đã thanh toán" },
            { id: "FULFILLED", label: "Hoàn thành" },
            { id: "CANCELLED", label: "Đã hủy" }
          ].map(status => (
            <button 
              key={status.id} 
              onClick={() => setStatusFilter(status.id)}
              className={`px-6 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                statusFilter === status.id 
                ? "bg-paper !text-asphalt border-paper shadow-[0_0_20px_rgba(239,237,227,0.3)]" 
                : "bg-paper/5 border-paper/10 text-paper/60 hover:text-paper hover:bg-paper/10"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3rem] border border-paper/10 overflow-x-auto shadow-2xl">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-paper/10 bg-paper/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Mã đơn</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Thời gian</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Sản phẩm</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Tổng tiền</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Trạng thái</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-12 bg-paper/5" />
                </tr>
              ))
            ) : orders.length === 0 ? (
                <tr>
                    <td colSpan={6} className="py-24 text-center text-paper/20 font-bold uppercase tracking-widest">
                        Không tìm thấy đơn hàng nào
                    </td>
                </tr>
            ) : orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-paper/5 transition-all group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-asphalt border border-paper/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#FF8C00]" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-tight text-paper">{order.orderCode}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-paper/80">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-[9px] font-bold text-paper/40">
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1 max-w-[200px]">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-paper/70 truncate" title={`${item.productName} x${item.quantity}`}>
                        {item.productName} <span className="text-[#FF8C00]">x{item.quantity}</span>
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-[9px] font-bold text-paper/40 italic">
                        + {order.items.length - 2} sản phẩm khác
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#FF8C00]">
                      {formatPrice(order.total)}₫
                    </span>
                    {order.couponCode && (
                       <span className="text-[9px] font-bold text-paper/40 uppercase mt-0.5">
                         Mã: {order.couponCode}
                       </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`bg-paper/5 hover:bg-paper/10 border border-paper/10 rounded-full py-1.5 px-3 text-[9px] font-bold uppercase tracking-widest outline-none transition-all cursor-pointer appearance-none ${
                        order.status === "PENDING" ? "text-yellow-500" :
                        order.status === "PAID" ? "text-blue-400" :
                        order.status === "FULFILLED" ? "text-green-400" :
                        "text-red-400"
                    }`}
                  >
                    <option value="PENDING" className="bg-asphalt text-paper">Chờ xử lý</option>
                    <option value="PAID" className="bg-asphalt text-paper">Đã thanh toán</option>
                    <option value="FULFILLED" className="bg-asphalt text-paper">Hoàn thành</option>
                    <option value="CANCELLED" className="bg-asphalt text-paper">Đã hủy</option>
                  </select>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-paper text-paper/40 hover:text-asphalt transition-all border border-paper/5"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order.id, order.orderCode)}
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-red-500/10 text-paper/40 hover:text-red-500 transition-all border border-paper/5"
                      title="Xóa đơn hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1a1917] border border-paper/10 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-paper/10 shrink-0">
                <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-paper flex items-center gap-3">
                        Chi tiết đơn hàng {selectedOrder.orderCode}
                    </h3>
                    <p className="text-[10px] font-bold text-paper/40 mt-1 uppercase tracking-widest">
                        Tạo lúc: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {getStatusBadge(selectedOrder.status)}
                    <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-paper/5 text-paper/40 transition-all"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                {/* Customer Info (Placeholder, add actual user info if linked) */}
                {selectedOrder.customerNote && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 mb-3 border-b border-paper/5 pb-2">Ghi chú của khách</h4>
                        <div className="bg-paper/5 p-4 rounded-xl border border-paper/5">
                            <p className="text-sm text-paper/80 whitespace-pre-wrap">{selectedOrder.customerNote}</p>
                        </div>
                    </div>
                )}

                {/* Items */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 mb-3 border-b border-paper/5 pb-2">Sản phẩm ({selectedOrder.items.length})</h4>
                    <div className="space-y-3">
                        {selectedOrder.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 bg-paper/5 rounded-xl border border-paper/5">
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-paper">{item.productName}</p>
                                    <p className="text-[10px] text-paper/40 mt-1 font-mono">{item.productSlug}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-bold text-[#FF8C00]">{formatPrice(item.unitPrice)}₫ <span className="text-paper/40 text-[10px] font-normal">x{item.quantity}</span></p>
                                    <p className="font-bold text-paper text-sm mt-0.5">{formatPrice(item.total)}₫</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 mb-3 border-b border-paper/5 pb-2">Thanh toán</h4>
                    <div className="bg-paper/5 p-5 rounded-2xl border border-paper/5 space-y-3">
                        <div className="flex justify-between text-sm text-paper/60 font-bold">
                            <span>Tạm tính:</span>
                            <span>{formatPrice(selectedOrder.subtotal)}₫</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-400 font-bold">
                                <span>Giảm giá {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}:</span>
                                <span>-{formatPrice(selectedOrder.discountAmount)}₫</span>
                            </div>
                        )}
                        <div className="pt-3 mt-3 border-t border-paper/10 flex justify-between items-center">
                            <span className="font-bold text-paper uppercase tracking-widest text-sm">Tổng cộng:</span>
                            <span className="text-2xl font-black text-[#FF8C00]">{formatPrice(selectedOrder.total)}₫</span>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-paper/10 shrink-0 flex justify-between items-center bg-[#1a1917]">
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-paper/40">Cập nhật trạng thái:</span>
                     <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className="bg-paper/10 border border-paper/10 rounded-lg py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest outline-none text-paper"
                    >
                        <option value="PENDING" className="bg-asphalt">Chờ xử lý</option>
                        <option value="PAID" className="bg-asphalt">Đã thanh toán</option>
                        <option value="FULFILLED" className="bg-asphalt">Hoàn thành</option>
                        <option value="CANCELLED" className="bg-asphalt">Đã hủy</option>
                    </select>
                 </div>
                 <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl bg-paper !text-asphalt font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                 >
                  Đóng
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1a1917] border border-paper/10 p-8 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md"
            >
              <h3 className="text-xl font-bold uppercase tracking-tight text-paper mb-2">{confirmModal.title}</h3>
              <p className="text-paper/60 text-sm font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-paper/40 hover:bg-paper/5 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
