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
  Trash2,
  Zap,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryAssetsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error'}>({
    isOpen: false, title: "", message: "", type: 'success'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const handleScanProducts = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/categories/config?scan=true");
      const dbCategories = await res.json();
      
      // Merge with current categories, avoid duplicates
      const merged = Array.from(new Set([...categories, ...dbCategories]));
      
      const newCount = merged.length - categories.length;
      setCategories(merged);
      
      if (newCount > 0) {
        showAlert("Thành công", `Đã tìm thấy và bổ sung ${newCount} danh mục mới từ sản phẩm!`, "success");
      } else {
        showAlert("Thông báo", "Danh sách danh mục đã đầy đủ, không tìm thấy mục mới.", "success");
      }
    } catch (error) {
      showAlert("Lỗi", "Không thể quét dữ liệu.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/categories/config");
      const data = await res.json();
      // Data can be an object or array now, handle both for transition
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories(Object.keys(data));
      }
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
        body: JSON.stringify(categories),
      });
      if (res.ok) {
        showAlert("Thành công", "Đã đồng bộ danh mục lên R2!", "success");
      } else {
        showAlert("Lỗi", "Không thể lưu. Kiểm tra kết nối.", "error");
      }
    } catch (error) {
      showAlert("Lỗi", "Lỗi hệ thống.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      showAlert("Lỗi", "Danh mục này đã tồn tại!", "error");
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(categories.filter(c => c !== name));
  };

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
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
              Quản lý Danh mục (R2)
            </h1>
            <p className="text-paper/30 text-[10px] font-bold uppercase tracking-widest mt-1">
              Đồng bộ danh sách loại sản phẩm lên hệ thống Cloudflare R2
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleScanProducts}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-2.5 bg-paper/5 hover:bg-paper/10 text-paper border border-paper/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-[#FF8C00] ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? "Đang quét..." : "Quét sản phẩm"}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-2.5 bg-asphalt hover:bg-asphalt/80 text-paper border border-paper/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#FF8C00]" />
            {isSaving ? "Đang xử lý..." : "Đồng bộ R2"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-paper/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-paper/10 space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-paper/30 px-2">Thêm danh mục mới</h2>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Tên danh mục (VD: Video, Graphics...)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1 bg-asphalt/50 border border-paper/10 rounded-2xl py-3 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper"
            />
            <button 
              onClick={handleAddCategory}
              className="px-6 bg-asphalt hover:bg-asphalt/80 text-paper border border-paper/10 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Thêm
            </button>
          </div>
        </div>

        <div className="w-full md:w-[350px] bg-paper/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-paper/10 space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-paper/30 px-2">Tìm kiếm nhanh</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
            <input 
              type="text" 
              placeholder="Lọc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-paper/5 animate-pulse rounded-3xl" />)
        ) : filteredCategories.map((cat) => (
          <motion.div 
            key={cat}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-paper/5 hover:bg-paper/10 backdrop-blur-3xl p-6 rounded-3xl border border-paper/10 flex justify-between items-center transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FF8C00] shadow-[0_0_10px_#FF8C00]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-paper">{cat}</span>
            </div>
            <button 
              onClick={() => handleDeleteCategory(cat)}
              className="p-2 opacity-0 group-hover:opacity-100 text-paper/20 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
