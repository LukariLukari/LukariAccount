"use client";

import { useEffect, useState } from "react";
import { 
  TicketPercent, 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Activity,
  X
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCoupons();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Mã giảm giá</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            Quản lý các chương trình khuyến mãi
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-paper text-asphalt px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center gap-3 shadow-2xl"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-paper/5 rounded-[2.5rem] animate-pulse" />)
        ) : coupons.map((coupon) => (
          <div key={coupon.id} className="bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-paper/10 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8C00]/10 flex items-center justify-center text-[#FF8C00]">
                  <TicketPercent className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-bold text-[#FF8C00]">-{coupon.discountPercent}%</span>
                  <span className="text-[10px] font-bold text-paper/20 uppercase tracking-widest">Giảm giá</span>
                </div>
             </div>

             <div className="mb-8">
                <p className="text-[10px] font-bold text-paper/20 uppercase tracking-widest mb-2">Mã code</p>
                <div className="text-2xl font-bold tracking-[0.2em] uppercase text-paper bg-paper/5 p-4 rounded-2xl border border-dashed border-paper/20 text-center">
                  {coupon.code}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-paper/20 uppercase tracking-widest flex items-center gap-2">
                     <Calendar className="w-3 h-3" /> Hết hạn
                   </p>
                   <p className="text-xs font-bold">{new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-paper/20 uppercase tracking-widest flex items-center gap-2">
                     <Users className="w-3 h-3" /> Lượt dùng
                   </p>
                   <p className="text-xs font-bold">{coupon.usageCount} / {coupon.usageLimit}</p>
                </div>
             </div>

             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-asphalt/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#1a1a1a] w-full max-w-lg rounded-[3rem] p-10 border border-paper/10 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-paper/20 hover:text-paper transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Tạo mã giảm giá</h2>

            <form onSubmit={handleCreate} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-2">Mã code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: LUKARI2026"
                    className="w-full bg-paper/5 border border-paper/10 rounded-2xl py-4 px-6 font-bold uppercase tracking-widest outline-none focus:border-[#FF8C00]/50 transition-all"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-2">% Giảm giá</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-paper/5 border border-paper/10 rounded-2xl py-4 px-6 font-bold outline-none focus:border-[#FF8C00]/50 transition-all"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-2">Giới hạn dùng</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-paper/5 border border-paper/10 rounded-2xl py-4 px-6 font-bold outline-none focus:border-[#FF8C00]/50 transition-all"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-2">Ngày hết hạn</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-paper/5 border border-paper/10 rounded-2xl py-4 px-6 font-bold outline-none focus:border-[#FF8C00]/50 transition-all"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
               </div>

               <button className="w-full bg-paper text-asphalt py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">
                 Xác nhận tạo mã
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
