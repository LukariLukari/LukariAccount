"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Upload,
  LayoutGrid,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryAssetsPage() {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error'}>({
    isOpen: false, title: "", message: "", type: 'success'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/categories/config");
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        showAlert("Thành công", "Đã lưu cấu hình danh mục lên R2 mượt mà!", "success");
      } else {
        showAlert("Lỗi", "Không thể lưu cấu hình. Vui lòng kiểm tra kết nối.", "error");
      }
    } catch (error) {
      showAlert("Lỗi", "Đã xảy ra lỗi hệ thống.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const updateCategoryField = (cat: string, field: string, value: string) => {
    setConfig({
      ...config,
      [cat]: {
        ...config[cat],
        [field]: value
      }
    });
  };

  const handleImageUpload = async (cat: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateCategoryField(cat, "image", data.url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = Object.keys(config).filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/products"
            className="p-4 rounded-2xl bg-paper/5 hover:bg-paper/10 border border-paper/10 text-paper/40 hover:text-paper transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-4">
              <LayoutGrid className="w-8 h-8 text-[#FF8C00]" />
              Liên kết Ảnh Danh mục (R2)
            </h1>
            <p className="text-paper/30 text-[10px] font-bold uppercase tracking-widest mt-1">
              Dữ liệu sẽ được lưu trữ dưới dạng JSON trên R2 để dễ dàng liên kết
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 px-10 py-4 bg-paper/10 hover:bg-paper/20 text-paper border border-paper/20 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#FF8C00]" />
          {isSaving ? "Đang xử lý..." : "Lưu lên R2"}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
        <input 
          type="text" 
          placeholder="Tìm danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-paper/5 border border-paper/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-paper/5 animate-pulse rounded-[2.5rem]" />)
        ) : filteredCategories.map((cat) => (
          <motion.div 
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-paper/10 space-y-6 group hover:border-paper/20 transition-all"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-tight text-paper">{cat}</h3>
              <Sparkles className="w-4 h-4 text-[#FF8C00] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <label className="aspect-video bg-asphalt/50 border-2 border-dashed border-paper/10 hover:border-paper/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center group/img relative cursor-pointer transition-all">
              {config[cat].image ? (
                <>
                  <img src={config[cat].image} alt={cat} className="w-full h-full object-cover transition-all group-hover/img:opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                    <span className="bg-paper text-asphalt px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-2xl">Đổi ảnh</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-paper/10 mb-2" />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-paper/20">Tải ảnh danh mục</p>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleImageUpload(cat, e.target.files[0])} 
              />
            </label>

            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20 ml-1">Mô tả ngắn</label>
              <textarea 
                value={config[cat].description || ""}
                onChange={(e) => updateCategoryField(cat, "description", e.target.value)}
                className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[10px] font-medium outline-none focus:border-paper/20 transition-all text-paper/60 resize-none"
                rows={2}
                placeholder="Nhập mô tả cho danh mục này..."
              />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {alertModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-asphalt/40 backdrop-blur-[40px] saturate-[180%]" 
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-paper/5 border border-white/10 p-12 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative z-10 w-full max-w-md text-center overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 -translate-y-1/2 blur-[100px] opacity-20 pointer-events-none ${
                alertModal.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />

              <div className={`w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center relative ${
                alertModal.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {alertModal.type === 'success' ? (
                  <CheckCircle className="w-12 h-12 relative z-10" />
                ) : (
                  <AlertTriangle className="w-12 h-12 relative z-10" />
                )}
                {/* Icon Inner Glow */}
                <div className={`absolute inset-0 rounded-[2rem] blur-xl opacity-40 ${
                  alertModal.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>

              <h3 className="text-3xl font-montserrat font-black uppercase tracking-tight text-paper mb-4">{alertModal.title}</h3>
              <p className="text-paper/40 text-sm font-medium mb-12 leading-relaxed px-2">{alertModal.message}</p>
              
              <button 
                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                className="group relative w-full py-5 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 rounded-[1.5rem] font-montserrat font-black text-[12px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
              >
                <span className="relative z-10">Đã hiểu</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
