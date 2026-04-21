"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  Eye, 
  EyeOff,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
  X,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compressImageToWebp } from "@/lib/utils";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  link: string | null;
  active: boolean;
  order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Banner>>({});

  // Add Workflow State
  const [isAdding, setIsAdding] = useState(false);
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerData, setNewBannerData] = useState<Partial<Banner>>({
    title: "",
    subtitle: "",
    link: ""
  });

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string}>({
    isOpen: false, title: "", message: ""
  });

  const showAlert = (title: string, message: string) => setAlertModal({ isOpen: true, title, message });
  const showConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ isOpen: true, title, message, onConfirm });

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUploadImage = async (file: File): Promise<string | null> => {
    try {
      const webpFile = await compressImageToWebp(file, 5);
      const uploadFormData = new FormData();
      uploadFormData.append("file", webpFile);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      });
      const data = await res.json();
      if (data.url) return data.url;
      showAlert("Lỗi upload", data.error || "Không rõ nguyên nhân");
      return null;
    } catch (err: any) {
      showAlert("Lỗi", err.message || "Đã xảy ra lỗi khi tải ảnh lên!");
      return null;
    }
  };

  const handleCreateNewBanner = async () => {
    if (!newBannerImage) return showAlert("Lỗi", "Vui lòng tải ảnh lên trước khi tạo banner.");
    
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBannerData.title || "Banner mới",
          subtitle: newBannerData.subtitle || "",
          link: newBannerData.link || "",
          image: newBannerImage,
          active: true,
          order: banners.length
        }),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewBannerImage(null);
        setNewBannerData({ title: "", subtitle: "", link: "" });
        fetchBanners();
      } else {
        showAlert("Lỗi", "Không thể tạo banner.");
      }
    } catch (error) {
      showAlert("Lỗi", "Đã có lỗi xảy ra.");
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setIsEditing(null);
        fetchBanners();
      } else {
        showAlert("Lỗi", "Không thể lưu thay đổi.");
      }
    } catch (error) {
      showAlert("Lỗi", "Đã có lỗi xảy ra.");
    }
  };

  const handleDelete = (id: string) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.", async () => {
      try {
        await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
        fetchBanners();
      } catch (error) {
        showAlert("Lỗi", "Không thể xóa banner.");
      }
    });
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !banner.active }),
      });
      fetchBanners();
    } catch (error) {
      showAlert("Lỗi", "Không thể cập nhật trạng thái.");
    }
  };

  if (isLoading) return <div className="p-10 text-paper/20 uppercase font-bold tracking-widest text-center">Đang tải...</div>;

  return (
    <div className="space-y-10 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý Banner</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            Tùy chỉnh hình ảnh và nội dung xuất hiện trên đầu trang chủ
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-8 py-4 bg-paper text-asphalt rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4" />
            Thêm Banner
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ADD BANNER WORKFLOW SECTION */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#1a1917] backdrop-blur-3xl rounded-[2.5rem] border border-[#FF8C00]/50 shadow-[0_0_30px_rgba(255,140,0,0.1)] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#FF8C00]">Tạo Banner Mới</h2>
                  <button onClick={() => { setIsAdding(false); setNewBannerImage(null); }} className="p-2 bg-paper/5 rounded-full hover:bg-paper/10 text-paper/40 hover:text-paper transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!newBannerImage ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-paper/10 rounded-3xl p-12 bg-asphalt/50 hover:bg-paper/5 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-paper/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-paper/40" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-paper/40 mb-4 text-center">Bắt đầu bằng cách chọn ảnh banner</p>
                    <label className="px-8 py-3 bg-paper/10 hover:bg-paper/20 border border-paper/10 text-paper rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all">
                      Tải ảnh lên
                      <input 
                        type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadImage(file);
                            if (url) setNewBannerImage(url);
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Preview Image */}
                    <div className="w-full lg:w-72 aspect-video lg:aspect-square rounded-[1.5rem] overflow-hidden bg-asphalt/50 relative border border-paper/10 shrink-0">
                      <img src={newBannerImage} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewBannerImage(null)}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit Form */}
                    <div className="flex-1 w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Tiêu đề chính</label>
                          <input 
                            type="text" 
                            value={newBannerData.title || ""}
                            onChange={(e) => setNewBannerData({ ...newBannerData, title: e.target.value })}
                            className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper focus:border-[#FF8C00]/50 transition-all"
                            placeholder="Nhập tiêu đề banner..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Tiêu đề phụ</label>
                          <input 
                            type="text" 
                            value={newBannerData.subtitle || ""}
                            onChange={(e) => setNewBannerData({ ...newBannerData, subtitle: e.target.value })}
                            className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper/60 focus:border-[#FF8C00]/50 transition-all"
                            placeholder="Nhập phụ đề..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Đường dẫn liên kết (Link)</label>
                          <input 
                            type="text" 
                            value={newBannerData.link || ""}
                            onChange={(e) => setNewBannerData({ ...newBannerData, link: e.target.value })}
                            className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper focus:border-[#FF8C00]/50 transition-all"
                            placeholder="Ví dụ: /products/canva"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-6 border-t border-paper/5">
                        <button 
                          onClick={() => { setIsAdding(false); setNewBannerImage(null); }}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-paper/40 hover:text-paper transition-all"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={handleCreateNewBanner}
                          className="flex items-center gap-2 px-8 py-3 bg-[#FF8C00] text-asphalt rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Hoàn tất & Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BANNERS LIST */}
        {banners.map((banner) => (
          <motion.div 
            key={banner.id}
            layout
            className={`bg-paper/5 backdrop-blur-3xl rounded-[2.5rem] border transition-all ${isEditing === banner.id ? 'border-[#FF8C00]/50 ring-1 ring-[#FF8C00]/20' : 'border-paper/10'}`}
          >
            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">
              {/* Preview */}
              <div className="w-full lg:w-72 aspect-video lg:aspect-square rounded-[1.5rem] overflow-hidden bg-asphalt/50 relative group border border-paper/10 shrink-0">
                <img src={isEditing === banner.id ? editData.image : banner.image} className="w-full h-full object-cover" />
                {!banner.active && <div className="absolute inset-0 bg-asphalt/60 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white/40">Đang ẩn</div>}
              </div>

              {/* Content */}
              <div className="flex-1 w-full space-y-6">
                {isEditing === banner.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Tiêu đề chính</label>
                      <input 
                        type="text" 
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper focus:border-[#FF8C00]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Tiêu đề phụ</label>
                      <input 
                        type="text" 
                        value={editData.subtitle || ""}
                        onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                        className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper/60 focus:border-[#FF8C00]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Đường dẫn liên kết</label>
                      <input 
                        type="text" 
                        value={editData.link || ""}
                        onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                        className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper focus:border-[#FF8C00]/50 transition-all"
                        placeholder="/products/slug"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      <label className="flex items-center justify-center bg-paper/10 hover:bg-paper/20 border border-paper/10 rounded-xl py-3 px-4 cursor-pointer transition-all">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-paper whitespace-nowrap">Đổi ảnh khác</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleUploadImage(file);
                              if (url) setEditData({ ...editData, image: url });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold uppercase tracking-tight">{banner.title || "Không có tiêu đề"}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${banner.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {banner.active ? "Đang hiện" : "Đang ẩn"}
                      </span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-paper/30 mb-6">{banner.subtitle || "Không có phụ đề"}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-paper/20">
                      <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {banner.link || "Không có link"}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-paper/5">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleActive(banner)}
                      className={`p-3 rounded-xl border transition-all ${banner.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-paper/5 text-paper/20 border-paper/5'}`}
                      title={banner.active ? "Ẩn banner" : "Hiện banner"}
                    >
                      {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing === banner.id ? (
                      <>
                        <button 
                          onClick={() => setIsEditing(null)}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-paper/40 hover:text-paper transition-all"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSave(banner.id)}
                          className="flex items-center gap-2 px-8 py-3 bg-[#FF8C00] text-asphalt rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Lưu
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setIsEditing(banner.id);
                            setEditData(banner);
                          }}
                          className="px-8 py-3 bg-paper/5 border border-paper/10 text-paper/60 hover:text-paper hover:bg-paper/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {banners.length === 0 && !isAdding && (
          <div className="py-20 bg-paper/5 border border-dashed border-paper/10 rounded-[3rem] flex flex-col items-center justify-center space-y-4">
            <ImageIcon className="w-12 h-12 text-paper/5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-paper/20">Chưa có banner nào được tạo</p>
          </div>
        )}
      </div>

      {/* CUSTOM MODALS */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
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

      <AnimatePresence>
        {alertModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAlertModal({ ...alertModal, isOpen: false })} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1a1917] border border-[#FF8C00]/30 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(255,140,0,0.1)] relative z-10 w-full max-w-md text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#FF8C00]/10 flex items-center justify-center mx-auto mb-4 text-[#FF8C00]">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-paper mb-2">{alertModal.title}</h3>
              <p className="text-paper/60 text-sm font-medium mb-8 leading-relaxed">{alertModal.message}</p>
              <button 
                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                className="w-full py-3 rounded-xl bg-paper/10 hover:bg-paper text-paper hover:text-asphalt font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
