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

interface Feature {
  icon: string;
  text: string;
}

interface GuideStep {
  step: string;
  description: string;
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
    warranty: initialData?.warranty || "",
    details: initialData?.details || "",
  });

  const [features, setFeatures] = useState<Feature[]>(initialData?.features || []);
  const [guide, setGuide] = useState<GuideStep[]>(initialData?.guide || []);

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
        warranty: initialData.warranty || "",
        details: initialData.details || "",
      });
      if (initialData.plans) setPlans(initialData.plans);
      if (initialData.features) setFeatures(initialData.features);
      if (initialData.guide) setGuide(initialData.guide);
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
        body: JSON.stringify({ ...formData, plans, features, guide }),
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

  const addFeature = () => setFeatures([...features, { icon: "Check", text: "" }]);
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features];
    newFeatures[idx] = { ...newFeatures[idx], [field]: value };
    setFeatures(newFeatures);
  };

  const addStep = () => setGuide([...guide, { step: "", description: "" }]);
  const removeStep = (idx: number) => setGuide(guide.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: keyof GuideStep, value: string) => {
    const newGuide = [...guide];
    newGuide[idx] = { ...newGuide[idx], [field]: value };
    setGuide(newGuide);
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
        {/* Left Side: General Info & Rich Content */}
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Mô tả ngắn</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none"
                  placeholder="Nhập mô tả ngắn gọn về sản phẩm..."
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
              <button type="button" onClick={addPlan} className="flex items-center gap-2 text-[10px] font-bold uppercase text-paper/60 hover:text-paper">
                <Plus className="w-3.5 h-3.5" /> Thêm gói
              </button>
            </div>
            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-paper/[0.03] border border-paper/5 rounded-2xl items-end relative group">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Tên gói</label>
                    <input type="text" value={plan.label} onChange={(e) => updatePlan(idx, "label", e.target.value)} className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Giá (₫)</label>
                    <input type="text" value={formatPrice(plan.price)} onChange={(e) => updatePlan(idx, "price", parseFormattedPrice(e.target.value))} className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-[#FF8C00]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Kỳ hạn</label>
                    <input type="text" value={plan.cycle} onChange={(e) => updatePlan(idx, "cycle", e.target.value)} className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper/60" />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removePlan(idx)} className="p-3 text-paper/10 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-paper/5 pb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30">Tính năng nổi bật</h2>
              <button type="button" onClick={addFeature} className="flex items-center gap-2 text-[10px] font-bold uppercase text-paper/60 hover:text-paper">
                <Plus className="w-3.5 h-3.5" /> Thêm tính năng
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-paper/[0.03] border border-paper/5 rounded-2xl group">
                  <input type="text" value={feat.text} onChange={(e) => updateFeature(idx, "text", e.target.value)} placeholder="Tên tính năng..." className="flex-1 bg-transparent text-[11px] font-bold outline-none text-paper placeholder:text-paper/20" />
                  <button type="button" onClick={() => removeFeature(idx)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/5 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* User Guide Section */}
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-paper/5 pb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30">Hướng dẫn sử dụng</h2>
              <button type="button" onClick={addStep} className="flex items-center gap-2 text-[10px] font-bold uppercase text-paper/60 hover:text-paper">
                <Plus className="w-3.5 h-3.5" /> Thêm bước
              </button>
            </div>
            <div className="space-y-6">
              {guide.map((step, idx) => (
                <div key={idx} className="space-y-4 p-6 bg-paper/[0.03] border border-paper/5 rounded-2xl relative group">
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-paper/5 flex items-center justify-center text-[10px] font-black text-paper/40">{idx + 1}</span>
                    <div className="flex-1 space-y-4">
                      <input type="text" value={step.step} onChange={(e) => updateStep(idx, "step", e.target.value)} placeholder="Tên bước hướng dẫn..." className="w-full bg-transparent text-[11px] font-bold outline-none text-paper border-b border-paper/5 pb-2 focus:border-paper/20 transition-all" />
                      <textarea rows={2} value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} placeholder="Mô tả chi tiết bước thực hiện..." className="w-full bg-transparent text-[10px] font-medium outline-none text-paper/60 resize-none" />
                    </div>
                    <button type="button" onClick={() => removeStep(idx)} className="opacity-0 group-hover:opacity-100 p-2 h-fit text-red-400 hover:bg-red-400/5 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Media & Settings */}
        <div className="space-y-8">
          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Hình ảnh</h2>
            <div className="aspect-square bg-asphalt/50 border border-paper/10 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group relative">
              {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-paper/5" />}
            </div>
            <input required type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper" placeholder="URL ảnh..." />
          </section>

          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Nội dung bổ sung</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40">Mô tả chi tiết (Markdown)</label>
                <textarea rows={10} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none" placeholder="Nội dung Markdown..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40">Chính sách bảo hành</label>
                <textarea rows={4} value={formData.warranty} onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none" placeholder="Chính sách bảo hành..." />
              </div>
            </div>
          </section>

          <section className="bg-paper/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Cài đặt</h2>
            <div className="flex items-center justify-between p-6 bg-paper/[0.03] rounded-2xl border border-paper/5">
              <span className="text-[11px] font-bold uppercase tracking-widest">Bán chạy</span>
              <button type="button" onClick={() => setFormData({ ...formData, isBestSeller: !formData.isBestSeller })} className={`w-14 h-8 rounded-full transition-all relative ${formData.isBestSeller ? 'bg-[#FF8C00]' : 'bg-paper/10'}`}>
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.isBestSeller ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
