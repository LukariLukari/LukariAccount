"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, CopyPlus, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import {
  CONTENT_SECTION_LABELS,
  DEFAULT_CONTENT_ORDER,
  DEFAULT_PRODUCT_CONTENT_TEMPLATES,
  type ContentSectionId,
  type ProductContentTemplate,
} from "@/lib/product-templates";

const emptyTemplate = (): ProductContentTemplate => ({
  id: `template-${Date.now()}`,
  name: "Template mới",
  description: "",
  details: "",
  warranty: "",
  features: [""],
  instructions: [""],
  sectionOrder: [...DEFAULT_CONTENT_ORDER],
});

export default function AdminProductTemplatesPage() {
  const [templates, setTemplates] = useState<ProductContentTemplate[]>(DEFAULT_PRODUCT_CONTENT_TEMPLATES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedTemplate = templates[selectedIndex] || templates[0];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/admin/product-templates");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        }
      } catch (error) {
        console.error("Failed to fetch product templates", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const updateTemplate = (patch: Partial<ProductContentTemplate>) => {
    setTemplates((prev) =>
      prev.map((template, index) =>
        index === selectedIndex ? { ...template, ...patch } : template
      )
    );
  };

  const updateListItem = (field: "features" | "instructions", itemIndex: number, value: string) => {
    const nextItems = [...(selectedTemplate[field] || [])];
    nextItems[itemIndex] = value;
    updateTemplate({ [field]: nextItems });
  };

  const addListItem = (field: "features" | "instructions") => {
    updateTemplate({ [field]: [...(selectedTemplate[field] || []), ""] });
  };

  const removeListItem = (field: "features" | "instructions", itemIndex: number) => {
    updateTemplate({ [field]: selectedTemplate[field].filter((_, index) => index !== itemIndex) });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedTemplate.sectionOrder.length) return;

    const nextOrder = [...selectedTemplate.sectionOrder];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    updateTemplate({ sectionOrder: nextOrder });
  };

  const addTemplate = () => {
    const nextTemplate = emptyTemplate();
    setTemplates((prev) => [...prev, nextTemplate]);
    setSelectedIndex(templates.length);
  };

  const duplicateTemplate = () => {
    const nextTemplate = {
      ...selectedTemplate,
      id: `${selectedTemplate.id}-copy-${Date.now()}`,
      name: `${selectedTemplate.name} copy`,
    };
    setTemplates((prev) => [...prev, nextTemplate]);
    setSelectedIndex(templates.length);
  };

  const removeTemplate = () => {
    if (templates.length <= 1) return;
    setTemplates((prev) => prev.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const moveTemplate = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= templates.length) return;
    const nextTemplates = [...templates];
    [nextTemplates[index], nextTemplates[targetIndex]] = [nextTemplates[targetIndex], nextTemplates[index]];
    setTemplates(nextTemplates);
    setSelectedIndex(targetIndex);
  };

  const saveTemplates = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/product-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Không thể lưu template");
      setTemplates(data.templates);
      setMessage("Đã lưu template. Trang chỉnh sửa sản phẩm sẽ dùng danh sách mới.");
    } catch (error: any) {
      setMessage(error.message || "Không thể lưu template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !selectedTemplate) {
    return <div className="text-paper/40 font-bold uppercase tracking-widest">Đang tải template...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FF8C00]">Product content</p>
          <h1 className="text-3xl font-bold uppercase tracking-tight lg:text-4xl">Template sản phẩm</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper/45">
            Quản lý mẫu mô tả, bảo hành, tính năng và cách thức mua. Khi sửa sản phẩm, admin chỉ cần bấm template để điền nhanh rồi chỉnh lại theo sản phẩm.
          </p>
        </div>
        <button
          type="button"
          onClick={saveTemplates}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 rounded-2xl !bg-[#efede3] px-8 py-4 text-[11px] font-bold uppercase tracking-widest !text-[#302f2c] shadow-2xl transition hover:scale-[1.02] disabled:opacity-50"
        >
          <Save className="h-4 w-4 !text-[#302f2c]" />
          {isSaving ? "Đang lưu..." : "Lưu template"}
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-paper/10 bg-paper/5 px-5 py-4 text-sm font-bold text-paper/70">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-paper/10 bg-paper/5 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/35">Danh sách</p>
            <button
              type="button"
              onClick={addTemplate}
              className="rounded-full bg-paper/10 p-2 text-paper/60 transition hover:bg-paper hover:text-asphalt"
              title="Thêm template"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`flex items-center gap-2 rounded-2xl border p-2 transition ${
                  selectedIndex === index
                    ? "border-paper/20 bg-paper text-asphalt"
                    : "border-paper/5 bg-asphalt/30 text-paper/55"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className="min-w-0 flex-1 px-3 py-2 text-left"
                >
                  <p className="truncate text-[11px] font-bold uppercase tracking-widest">{template.name}</p>
                  <p className={`mt-1 text-[8px] font-bold uppercase tracking-widest ${selectedIndex === index ? "text-asphalt/45" : "text-paper/25"}`}>
                    {template.features.length} tính năng · {template.instructions.length} bước
                  </p>
                </button>
                <div className="flex shrink-0">
                  <button type="button" onClick={() => moveTemplate(index, "up")} disabled={index === 0} className="rounded-lg p-1.5 opacity-50 transition hover:bg-black/10 hover:opacity-100 disabled:opacity-15">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => moveTemplate(index, "down")} disabled={index === templates.length - 1} className="rounded-lg p-1.5 opacity-50 transition hover:bg-black/10 hover:opacity-100 disabled:opacity-15">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-6 rounded-[2rem] border border-paper/10 bg-paper/5 p-5 shadow-2xl lg:p-8">
          <div className="flex flex-col gap-3 border-b border-paper/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF8C00]/10 text-[#FF8C00]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/35">Đang chỉnh</p>
                <h2 className="text-lg font-bold uppercase text-paper">{selectedTemplate.name}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={duplicateTemplate} className="flex items-center gap-2 rounded-xl bg-paper/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper/60 transition hover:bg-paper hover:text-asphalt">
                <CopyPlus className="h-4 w-4" />
                Nhân bản
              </button>
              <button type="button" onClick={removeTemplate} disabled={templates.length <= 1} className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Tên template">
              <input value={selectedTemplate.name} onChange={(e) => updateTemplate({ name: e.target.value })} className="admin-template-input" />
            </Field>
            <Field label="ID">
              <input value={selectedTemplate.id} onChange={(e) => updateTemplate({ id: e.target.value })} className="admin-template-input font-mono text-paper/60" />
            </Field>
          </div>

          <Field label="Mô tả ngắn">
            <textarea rows={3} value={selectedTemplate.description} onChange={(e) => updateTemplate({ description: e.target.value })} className="admin-template-input resize-none" />
          </Field>

          <Field label="Thông tin chi tiết">
            <textarea rows={6} value={selectedTemplate.details} onChange={(e) => updateTemplate({ details: e.target.value })} className="admin-template-input resize-none" />
          </Field>

          <Field label="Chính sách bảo hành">
            <textarea rows={6} value={selectedTemplate.warranty} onChange={(e) => updateTemplate({ warranty: e.target.value })} className="admin-template-input resize-none" placeholder="Tiêu đề: Nội dung. Dùng **chữ cần nhấn** để highlight." />
          </Field>

          <ListEditor
            title="Tính năng"
            items={selectedTemplate.features}
            onAdd={() => addListItem("features")}
            onChange={(index, value) => updateListItem("features", index, value)}
            onRemove={(index) => removeListItem("features", index)}
          />

          <ListEditor
            title="Cách thức mua"
            items={selectedTemplate.instructions}
            onAdd={() => addListItem("instructions")}
            onChange={(index, value) => updateListItem("instructions", index, value)}
            onRemove={(index) => removeListItem("instructions", index)}
          />

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40">Thứ tự thẻ bên trang user</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {selectedTemplate.sectionOrder.map((sectionId, index) => (
                <div key={sectionId} className="flex items-center justify-between gap-3 rounded-2xl border border-paper/10 bg-asphalt/35 p-4">
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF8C00]">#{index + 1}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-paper">{CONTENT_SECTION_LABELS[sectionId]}</p>
                  </div>
                  <div className="flex">
                    <button type="button" onClick={() => moveSection(index, "up")} disabled={index === 0} className="rounded-xl p-2 text-paper/25 transition hover:bg-paper/5 hover:text-paper disabled:opacity-20">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveSection(index, "down")} disabled={index === selectedTemplate.sectionOrder.length - 1} className="rounded-xl p-2 text-paper/25 transition hover:bg-paper/5 hover:text-paper disabled:opacity-20">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-paper/40">{label}</span>
      {children}
    </label>
  );
}

function ListEditor({
  title,
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  items: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40">{title}</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-paper/55 transition hover:text-paper">
          <Plus className="h-3.5 w-3.5" />
          Thêm dòng
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input value={item} onChange={(e) => onChange(index, e.target.value)} className="admin-template-input" />
            <button type="button" onClick={() => onRemove(index)} className="rounded-xl px-3 text-paper/20 transition hover:bg-red-500/10 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
