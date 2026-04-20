"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  TicketPercent
} from "lucide-react";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStatsData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      label: "Sản phẩm", 
      value: statsData?.productCount || "...", 
      trend: "+2", 
      isUp: true, 
      icon: ShoppingBag,
      color: "text-blue-400"
    },
    { 
      label: "Người dùng", 
      value: statsData?.userCount || "...", 
      trend: "+1", 
      isUp: true, 
      icon: Users,
      color: "text-purple-400"
    },
    { 
      label: "Doanh thu", 
      value: statsData?.revenue || "...", 
      trend: "+18.3%", 
      isUp: true, 
      icon: CreditCard,
      color: "text-green-400"
    },
    { 
      label: "Mã giảm giá", 
      value: statsData?.couponCount || "...", 
      trend: "0", 
      isUp: true, 
      icon: TicketPercent,
      color: "text-[#FF8C00]"
    },
  ];
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Bảng điều khiển</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            Tổng quan hiệu quả kinh doanh của bạn
          </p>
        </div>
        <div className="px-6 py-3 bg-paper/5 border border-paper/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
          Hôm nay: 20/04/2026
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-paper/5 backdrop-blur-3xl border border-paper/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-paper/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-paper/5 border border-paper/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.isUp ? 'text-green-400' : 'text-red-400'}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-paper/40 text-[9px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Charts */}
        <div className="bg-paper/5 backdrop-blur-3xl border border-paper/10 p-10 rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-paper/10 mb-4" />
          <p className="text-paper/30 text-[10px] font-bold uppercase tracking-[0.3em]">Biểu đồ doanh thu (Coming Soon)</p>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="bg-paper/5 backdrop-blur-3xl border border-paper/10 p-10 rounded-[3rem] h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-8 border-b border-paper/10 pb-6">Hoạt động gần đây</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#FF8C00]" />
                <p className="text-[11px] font-bold text-paper/60">Người dùng <span className="text-paper">Admin</span> vừa cập nhật giá sản phẩm <span className="text-paper">ChatGPT Plus</span></p>
                <span className="ml-auto text-[9px] text-paper/20">2h trước</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
