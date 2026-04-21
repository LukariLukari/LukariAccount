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
  Link as LinkIcon
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
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Banner>>({});

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

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Banner mới",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
          active: false,
          order: banners.length
        }),
      });
      if (res.ok) fetchBanners();
    } catch (error) {
      console.error(error);
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch (error) {
      console.error(error);
    }
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
      console.error(error);
    }
  };

  if (isLoading) return <div className="p-10 text-paper/20 uppercase font-bold tracking-widest text-center">Đang tải...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý Banner</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            Tùy chỉnh hình ảnh và nội dung xuất hiện trên đầu trang chủ
          </p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-8 py-4 bg-paper text-asphalt rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
        >
          <Plus className="w-4 h-4" />
          Thêm Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Hình ảnh (Upload hoặc dán URL)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editData.image || ""}
                          onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                          className="flex-1 bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper/40 focus:border-[#FF8C00]/50 transition-all"
                        />
                        <label className="flex items-center justify-center bg-paper/10 hover:bg-paper/20 border border-paper/10 rounded-xl px-4 cursor-pointer transition-all">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-paper whitespace-nowrap">Tải ảnh lên</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              try {
                                // Compress and convert to webp (limits to 5MB max original size)
                                const webpFile = await compressImageToWebp(file, 5);

                                const uploadFormData = new FormData();
                                uploadFormData.append("file", webpFile);
                                
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: uploadFormData
                                });
                                const data = await res.json();
                                if (data.url) {
                                  setEditData({ ...editData, image: data.url });
                                } else {
                                  alert("Lỗi upload: " + (data.error || "Không rõ nguyên nhân"));
                                }
                              } catch (err: any) {
                                alert(err.message || "Đã xảy ra lỗi khi tải ảnh lên!");
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-paper/30 ml-1">Link liên kết</label>
                      <input 
                        type="text" 
                        value={editData.link || ""}
                        onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                        className="w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold outline-none text-paper focus:border-[#FF8C00]/50 transition-all"
                        placeholder="/products/slug"
                      />
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
                    <button className="p-3 rounded-xl bg-paper/5 text-paper/20 border border-paper/5 hover:text-paper transition-all">
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button className="p-3 rounded-xl bg-paper/5 text-paper/20 border border-paper/5 hover:text-paper transition-all">
                      <MoveDown className="w-4 h-4" />
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
                          Lưu thay đổi
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

        {banners.length === 0 && (
          <div className="py-20 bg-paper/5 border border-dashed border-paper/10 rounded-[3rem] flex flex-col items-center justify-center space-y-4">
            <ImageIcon className="w-12 h-12 text-paper/5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-paper/20">Chưa có banner nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
}
