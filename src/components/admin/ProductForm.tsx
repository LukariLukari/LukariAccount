"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { formatPrice, parseFormattedPrice } from "@/lib/utils";

interface Plan {
  label: string;
  price: number;
  cycle: string;
}

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(initialData?.plans || [
    { label: "1 Tháng", price: 0, cycle: "tháng" },
    { label: "6 Tháng", price: 0, cycle: "6 tháng" },
    { label: "1 Năm", price: 0, cycle: "năm" },
  ]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    billingCycle: initialData?.billingCycle || "tháng",
    category: initialData?.category || "AI",
    image: initialData?.image || "",
    isBestSeller: initialData?.isBestSeller || false,
  });

  // Sync state when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        originalPrice: initialData.originalPrice || 0,
        billingCycle: initialData.billingCycle || "tháng",
        category: initialData.category || "AI",
        image: initialData.image || "",
        isBestSeller: initialData.isBestSeller || false,
      });
      if (initialData.plans) {
        setPlans(initialData.plans);
      }
    }
  }, [initialData]);

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, plans }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert("Có lỗi xảy ra khi lưu sản phẩm");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  const addPlan = () => {
    setPlans([...plans, { label: "Gói mới", price: 0, cycle: "kỳ hạn" }]);
  };

  const removePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const updatePlan = (index: number, field: keyof Plan, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/products"
            className="p-4 rounded-2xl bg-paper/5 hover:bg-paper/10 border border-paper/10 text-paper/40 hover:text-paper transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              {productId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h1>
            <p className="text-paper/30 text-[10px] font-bold uppercase tracking-widest mt-1">
              Thiết lập thông tin và cấu hình giá
            </p>
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-3 px-10 py-4 !bg-[#efede3] !text-[#302f2c] rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
        >
          <Save className="w-4 h-4 !text-[#302f2c]" />
          {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Thông tin cơ bản</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Tên sản phẩm</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper"
                    placeholder="VD: ChatGPT Plus"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Slug (Đường dẫn)</label>
                    <button 
                      type="button" 
                      onClick={generateSlug}
                      className="text-[9px] font-bold uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Tự động
                    </button>
                  </div>
                  <input 
                    required
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper"
                    placeholder="chatgpt-plus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Mô tả sản phẩm</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Giá hiển thị (₫)</label>
                  <input 
                    required
                    type="text" 
                    value={formatPrice(formData.price)}
                    onChange={(e) => setFormData({ ...formData, price: parseFormattedPrice(e.target.value) })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-[#FF8C00]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Giá gốc (₫)</label>
                  <input 
                    type="text" 
                    value={formatPrice(formData.originalPrice || 0)}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFormattedPrice(e.target.value) })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Danh mục</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper appearance-none cursor-pointer"
                  >
                    <option value="AI">AI</option>
                    <option value="Office">Office</option>
                    <option value="Design">Design</option>
                    <option value="OS">OS</option>
                    <option value="Video">Video</option>
                    <option value="Combo iOS">Combo iOS</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-paper/5 pb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30">Cấu hình các gói (Plans)</h2>
              <button 
                type="button" 
                onClick={addPlan}
                className="flex items-center gap-2 text-[10px] font-bold uppercase text-paper/60 hover:text-paper"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm gói
              </button>
            </div>

            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-paper/[0.03] border border-paper/5 rounded-2xl items-end relative group">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Tên gói</label>
                    <input 
                      type="text" 
                      value={plan.label}
                      onChange={(e) => updatePlan(idx, "label", e.target.value)}
                      className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Giá tiền (₫)</label>
                    <input 
                      type="text" 
                      value={formatPrice(plan.price)}
                      onChange={(e) => updatePlan(idx, "price", parseFormattedPrice(e.target.value))}
                      className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-[#FF8C00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Kỳ hạn</label>
                    <input 
                      type="text" 
                      value={plan.cycle}
                      onChange={(e) => updatePlan(idx, "cycle", e.target.value)}
                      className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper/60"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removePlan(idx)}
                      className="p-3 text-paper/10 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Media & Settings */}
        <div className="space-y-8">
          {/* Image Selection */}
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Hình ảnh</h2>
            
            <div className="space-y-6">
              <div className="aspect-square bg-asphalt/50 border border-paper/10 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group relative">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-paper/5 mb-4" />
                    <p className="text-[9px] font-bold uppercase text-paper/20 tracking-widest">Chưa có ảnh</p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Đường dẫn ảnh (URL)</label>
                <input 
                  required
                  type="text" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          </section>

          {/* Visibility Settings */}
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Cài đặt hiển thị</h2>
            
            <div className="flex items-center justify-between p-6 bg-paper/[0.03] rounded-2xl border border-paper/5">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-paper mb-1">Sản phẩm bán chạy</h3>
                <p className="text-[9px] text-paper/30 font-bold uppercase">Hiển thị huy hiệu Best Seller</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isBestSeller: !formData.isBestSeller })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.isBestSeller ? 'bg-[#FF8C00]' : 'bg-paper/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isBestSeller ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="p-6 bg-paper/5 rounded-2xl border border-paper/10">
              <p className="text-[9px] font-bold text-paper/40 leading-relaxed uppercase tracking-wider text-center">
                Vui lòng kiểm tra kỹ thông tin trước khi lưu. Các thay đổi sẽ có hiệu lực ngay lập tức trên trang chủ.
              </p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
