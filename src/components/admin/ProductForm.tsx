"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowDown,
  ArrowLeft, 
  ArrowUp,
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, parseFormattedPrice, compressImageToWebp } from "@/lib/utils";
import RichText from "@/components/RichText";
import {
  CONTENT_SECTION_LABELS,
  DEFAULT_CONTENT_ORDER,
  DEFAULT_PRODUCT_CONTENT_TEMPLATES,
  type ContentSectionId,
  type ProductContentTemplate,
} from "@/lib/product-templates";

interface Plan {
  type?: string;
  label: string;
  price: number;
  cycle: string;
}

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getFeatureItems(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(input) && Array.isArray(input.items)) {
    return input.items.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function getContentOrder(input: unknown): ContentSectionId[] {
  const rawOrder =
    isRecord(input) && Array.isArray(input.sectionOrder)
      ? input.sectionOrder
      : DEFAULT_CONTENT_ORDER;
  const validOrder = rawOrder.filter(
    (item): item is ContentSectionId =>
      typeof item === "string" && DEFAULT_CONTENT_ORDER.includes(item as ContentSectionId)
  );

  return [...validOrder, ...DEFAULT_CONTENT_ORDER.filter((item) => !validOrder.includes(item))];
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(initialData?.plans || [
    { type: "Mặc định", label: "1 Tháng", price: 0, cycle: "tháng" },
    { type: "Mặc định", label: "6 Tháng", price: 0, cycle: "6 tháng" },
    { type: "Mặc định", label: "1 Năm", price: 0, cycle: "năm" },
  ]);
  const [features, setFeatures] = useState<string[]>(getFeatureItems(initialData?.features));
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || []);
  const [contentOrder, setContentOrder] = useState<ContentSectionId[]>(getContentOrder(initialData?.features));
  const [contentTemplates, setContentTemplates] = useState<ProductContentTemplate[]>(DEFAULT_PRODUCT_CONTENT_TEMPLATES);

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
    isHidden: initialData?.isHidden || false,
    isSoldOut: initialData?.isSoldOut || false,
    warranty: initialData?.warranty || "",
    details: initialData?.details || "",
  });

  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string}>({
    isOpen: false, title: "", message: ""
  });
  const [categories, setCategories] = useState<string[]>([]);

  const showAlert = (title: string, message: string) => setAlertModal({ isOpen: true, title, message });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories/config");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0] }));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategories(["AI", "Office", "Design", "OS", "Video", "Combo iOS"]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/admin/product-templates");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setContentTemplates(data);
        }
      } catch (error) {
        console.error("Failed to fetch product templates", error);
      }
    };
    fetchTemplates();
  }, []);

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
        isHidden: initialData.isHidden || false,
        isSoldOut: initialData.isSoldOut || false,
        warranty: initialData.warranty || "",
        details: initialData.details || "",
      });
      if (initialData.plans) setPlans(initialData.plans);
      setFeatures(getFeatureItems(initialData.features));
      setContentOrder(getContentOrder(initialData.features));
      if (initialData.instructions) setInstructions(initialData.instructions);
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
        body: JSON.stringify({ 
          ...formData,
          plans, 
          features: {
            items: features.map((feature) => feature.trim()).filter(Boolean),
            sectionOrder: contentOrder,
          },
          instructions: instructions.map((instruction) => instruction.trim()).filter(Boolean),
          warranty: formData.warranty.trim(),
          details: formData.details.trim(),
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        showAlert("Lỗi", "Có lỗi xảy ra khi lưu sản phẩm");
      }
    } catch (error) {
      console.error(error);
      showAlert("Lỗi", "Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  const addPlan = () => {
    setPlans([...plans, { type: "Mặc định", label: "Gói mới", price: 0, cycle: "kỳ hạn" }]);
  };

  const removePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const movePlan = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= plans.length) return;

    const nextPlans = [...plans];
    [nextPlans[index], nextPlans[targetIndex]] = [nextPlans[targetIndex], nextPlans[index]];
    setPlans(nextPlans);
  };

  const updatePlan = (index: number, field: keyof Plan, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };
  const moveContentSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contentOrder.length) return;

    const nextOrder = [...contentOrder];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    setContentOrder(nextOrder);
  };

  const applyContentTemplate = (template: ProductContentTemplate) => {
    setFormData((prev) => ({
      ...prev,
      description: template.description,
      details: template.details,
      warranty: template.warranty,
    }));
    setFeatures(template.features);
    setInstructions(template.instructions);
    setContentOrder(template.sectionOrder);
  };

  const warrantyLines = String(formData.warranty || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 lg:space-y-10 pb-32 lg:pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link 
            href="/admin/products"
            className="p-3 lg:p-4 rounded-2xl bg-paper/5 hover:bg-paper/10 border border-paper/10 text-paper/40 hover:text-paper transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight">
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
          className="hidden lg:flex items-center gap-3 px-10 py-4 !bg-[#efede3] !text-[#302f2c] rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
        >
          <Save className="w-4 h-4 !text-[#302f2c]" />
          {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-paper/5 backdrop-blur-3xl p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
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
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-asphalt text-paper">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="bg-paper/5 backdrop-blur-3xl p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
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
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 p-4 lg:p-6 bg-paper/[0.03] border border-paper/5 rounded-2xl items-end relative group">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Phân loại (Loại gói)</label>
                    <input 
                      type="text" 
                      value={plan.type || ""}
                      onChange={(e) => updatePlan(idx, "type", e.target.value)}
                      className="w-full bg-asphalt/50 border border-transparent focus:border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper"
                      placeholder="VD: Cấp sẵn, Nâng cấp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-paper/20">Thời hạn / Tên gói</label>
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
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => movePlan(idx, "up")}
                      disabled={idx === 0}
                      className="p-3 text-paper/20 hover:text-paper hover:bg-paper/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Đưa gói lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePlan(idx, "down")}
                      disabled={idx === plans.length - 1}
                      className="p-3 text-paper/20 hover:text-paper hover:bg-paper/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Đưa gói xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
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

          {/* Detailed Content Sections */}
          <section className="bg-paper/5 backdrop-blur-3xl p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-paper/10 space-y-10 shadow-2xl">
            <div className="border-b border-paper/5 pb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30">Nội dung chi tiết</h2>
              <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-paper/25">
                Dùng template để điền nhanh, sau đó chỉnh lại theo từng sản phẩm trước khi lưu.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-paper/10 bg-asphalt/35 p-4 lg:p-5">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/35">
                <Sparkles className="w-4 h-4 text-[#FF8C00]" />
                Template nội dung
              </div>
              <div className="flex flex-wrap gap-2">
                {contentTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyContentTemplate(template)}
                    className="rounded-full border border-paper/10 bg-paper/5 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-paper/60 transition hover:bg-paper hover:!text-asphalt"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">
                    Thứ tự thẻ thông tin bên cạnh
                  </label>
                  <p className="text-[9px] text-paper/25 font-bold uppercase tracking-widest mt-2 ml-1">
                    Sắp xếp thứ tự hiển thị Bảo hành, Tính năng và Cách thức mua. Thông tin chi tiết là thẻ riêng bên dưới.
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-paper/25">
                  {contentOrder.length} mục
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contentOrder.map((sectionId, index) => (
                  <div
                    key={sectionId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-paper/10 bg-asphalt/35 px-4 py-3"
                  >
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF8C00] mb-1">
                        #{index + 1}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-paper">
                        {CONTENT_SECTION_LABELS[sectionId]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveContentSection(index, "up")}
                        disabled={index === 0}
                        className="p-2.5 text-paper/25 hover:text-paper hover:bg-paper/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Đưa mục lên"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveContentSection(index, "down")}
                        disabled={index === contentOrder.length - 1}
                        className="p-2.5 text-paper/25 hover:text-paper hover:bg-paper/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Đưa mục xuống"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Detailed Description */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Mô tả ngắn hiển thị đầu trang</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none"
                    placeholder="VD: Giải pháp phù hợp cho nhu cầu sử dụng lâu dài và ổn định."
                  />
                </div>
                <div className="rounded-2xl border border-paper/10 bg-paper/[0.03] p-5 flex flex-col justify-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-paper/25 mb-2">Hiển thị user</p>
                  <p className="text-paper text-[13px] leading-relaxed line-clamp-4">
                    <RichText text={formData.description || "Mô tả ngắn sẽ xuất hiện ngay dưới tên sản phẩm."} />
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Thông tin chi tiết</label>
              <textarea 
                rows={10}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none"
                placeholder="Nhập nội dung mô tả dài. Xuống dòng để chia đoạn trên trang user."
              />
            </div>

            {/* Key Features */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Tính năng nổi bật</label>
                <button type="button" onClick={addFeature} className="text-[9px] font-bold uppercase text-paper/60 hover:text-paper flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Thêm tính năng
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={feature}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      className="flex-1 bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper"
                      placeholder="VD: Bảo mật 2 lớp"
                    />
                    <button type="button" onClick={() => removeFeature(idx)} className="p-3 text-paper/10 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Hướng dẫn sử dụng (Các bước)</label>
                <button type="button" onClick={addInstruction} className="text-[9px] font-bold uppercase text-paper/60 hover:text-paper flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Thêm bước
                </button>
              </div>
              <div className="space-y-4">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="w-8 h-8 rounded-full bg-paper/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">{idx + 1}</span>
                    <textarea 
                      rows={2}
                      value={step}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      className="flex-1 bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[10px] font-bold outline-none text-paper resize-none"
                      placeholder={`Bước ${idx + 1}...`}
                    />
                    <button type="button" onClick={() => removeInstruction(idx)} className="p-3 text-paper/10 hover:text-red-400 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Policy */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Chính sách bảo hành</label>
                  <p className="text-[9px] text-paper/25 font-bold uppercase tracking-widest mt-2 ml-1">
                    Mỗi dòng sẽ thành 1 mục. Nhập "Tiêu đề: Nội dung" để custom đề mục. Dùng **chữ cần nhấn** để highlight.
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-paper/25">
                  {warrantyLines.length} mục
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-4">
                <textarea 
                  rows={7}
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-paper/40 transition-all text-paper resize-none"
                  placeholder={`Kích hoạt tức thì: Kích hoạt sau khi đối soát thanh toán.\nLỗi 1 đổi 1: Hỗ trợ đổi nếu lỗi từ phía tài khoản hoặc key.\nBảo hành rõ ràng: Khách có **3 lần hỗ trợ vàng** và **1 lần hỗ trợ lớn**.`}
                />
                <div className="rounded-2xl border border-paper/10 bg-paper/[0.03] p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-paper/25 mb-3">Preview</p>
                  <div className="space-y-3">
                    {(warrantyLines.slice(0, 3).length > 0
                      ? warrantyLines.slice(0, 3)
                      : ["Bảo hành rõ ràng: Nội dung bảo hành sẽ hiển thị tại đây."]
                    ).map((line, index) => {
                      const [title, ...descParts] = line.split(":");
                      const hasTitle = descParts.length > 0 && title.trim().length > 0;
                      return (
                        <div key={`${line}-${index}`} className="rounded-xl bg-asphalt/40 border border-paper/10 p-3">
                          {hasTitle && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-paper mb-1">
                              <RichText text={title.trim()} />
                            </p>
                          )}
                          <p className="text-[11px] text-paper leading-relaxed">
                            <RichText text={(hasTitle ? descParts.join(":") : line).trim()} />
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Media & Settings */}
        <div className="space-y-8">
          {/* Image Selection */}
          <section className="bg-paper/5 backdrop-blur-3xl p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-paper/30 border-b border-paper/5 pb-6">Hình ảnh</h2>
            
            <div className="space-y-6">
              <label className="aspect-square bg-asphalt/50 border-2 border-dashed border-paper/10 hover:border-paper/30 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group relative cursor-pointer transition-all shadow-inner">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-all group-hover:opacity-40 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="bg-paper text-asphalt px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Đổi ảnh
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-paper/20 mb-4 group-hover:scale-110 group-hover:text-paper/40 transition-all" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40 group-hover:text-paper/60 transition-colors">Nhấn để tải ảnh lên</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-paper/20 mt-2">Tự động nén WebP • Tối đa 5MB</p>
                  </>
                )}
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
                        setFormData({ ...formData, image: data.url });
                      } else {
                        showAlert("Lỗi upload", data.error || "Không rõ nguyên nhân");
                      }
                    } catch (err: any) {
                      showAlert("Lỗi", err.message || "Đã xảy ra lỗi khi tải ảnh lên!");
                    }
                  }}
                />
              </label>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-paper/40 ml-1">Hoặc dán đường dẫn ảnh (URL)</label>
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
          <section className="bg-paper/5 backdrop-blur-3xl p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-paper/10 space-y-8 shadow-2xl">
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

            <div className="flex items-center justify-between p-6 bg-paper/[0.03] rounded-2xl border border-paper/5">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-paper mb-1">Sold out / tạm hết</h3>
                <p className="text-[9px] text-paper/30 font-bold uppercase">Vẫn hiển thị sản phẩm nhưng chặn mua và hiện nhãn sold out</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isSoldOut: !formData.isSoldOut })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.isSoldOut ? 'bg-red-500' : 'bg-paper/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isSoldOut ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-paper/[0.03] rounded-2xl border border-paper/5">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-paper mb-1">Tạm ẩn khỏi cửa hàng</h3>
                <p className="text-[9px] text-paper/30 font-bold uppercase">Không hiển thị ở trang user và link chi tiết sẽ trả về 404</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isHidden: !formData.isHidden })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.isHidden ? 'bg-paper text-asphalt' : 'bg-paper/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isHidden ? 'left-7' : 'left-1'}`} />
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

      <div className="fixed inset-x-3 bottom-3 z-[80] rounded-[1.5rem] border border-paper/15 bg-[#efede3] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:hidden">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-[1.1rem] px-5 py-4 !text-[#302f2c] font-bold text-[11px] uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="w-4 h-4 !text-[#302f2c]" />
          {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>

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
                type="button"
                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                className="w-full py-3 rounded-xl bg-paper/10 hover:bg-paper text-paper hover:text-asphalt font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
