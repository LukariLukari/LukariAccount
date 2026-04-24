"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  FileText,
  ImageIcon,
  ImagePlus,
  Link2,
  PencilLine,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  RESOURCE_CATEGORIES,
  createEmptyResource,
  normalizeResources,
  reindexResources,
  type FreeResource,
} from "@/lib/resources";

export default function AdminResourcesPage() {
  type ResourcePanel = "content" | "media" | "drive";

  const [resources, setResources] = useState<FreeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<Record<string, ResourcePanel>>({});

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/admin/resources");
        const data = await res.json();
        setResources(normalizeResources(data));
      } catch (error) {
        setMessage({ type: "error", text: "Không thể tải dữ liệu tài nguyên." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const resourceCountLabel = useMemo(() => {
    if (resources.length === 0) return "Chưa có tài nguyên nào";
    return `${resources.length} tài nguyên miễn phí`;
  }, [resources.length]);

  const updateResource = (id: string, field: keyof FreeResource, value: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, [field]: value } : resource
      )
    );
  };

  const addResource = () => {
    const nextResource = createEmptyResource();
    setResources((prev) => reindexResources([...prev, nextResource]));
    setExpandedResourceId(nextResource.id);
    setActivePanel((prev) => ({ ...prev, [nextResource.id]: "content" }));
  };

  const removeResource = (id: string) => {
    setResources((prev) => reindexResources(prev.filter((resource) => resource.id !== id)));
    setExpandedResourceId((prev) => (prev === id ? null : prev));
  };

  const moveResource = (id: string, direction: "up" | "down") => {
    setResources((prev) => {
      const currentIndex = prev.findIndex((resource) => resource.id === id);
      if (currentIndex === -1) return prev;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return reindexResources(next);
    });
  };

  const toggleExpandedResource = (id: string) => {
    setExpandedResourceId((prev) => (prev === id ? null : id));
    setActivePanel((prev) => ({ ...prev, [id]: prev[id] || "content" }));
  };

  const openResourcePanel = (id: string, panel: ResourcePanel) => {
    setExpandedResourceId(id);
    setActivePanel((prev) => ({ ...prev, [id]: panel }));
  };

  const updateResourceImage = (id: string, imageIndex: number, value: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              images: resource.images.map((image, index) => (index === imageIndex ? value : image)),
            }
          : resource
      )
    );
  };

  const addResourceImage = (id: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? { ...resource, images: [...resource.images, ""] }
          : resource
      )
    );
  };

  const appendResourceImages = (id: string, nextImages: string[]) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              images: [...resource.images, ...nextImages.filter((image) => image.trim().length > 0)],
            }
          : resource
      )
    );
  };

  const removeResourceImage = (id: string, imageIndex: number) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? { ...resource, images: resource.images.filter((_, index) => index !== imageIndex) }
          : resource
      )
    );
  };

  const handleImageUpload = async (id: string, file: File, imageIndex: number) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingIds((prev) => [...prev, id]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload thất bại.");
      }

      updateResourceImage(id, imageIndex, data.url);
      setMessage({ type: "success", text: "Đã tải ảnh mô tả lên thành công." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload thất bại.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setUploadingIds((prev) => prev.filter((resourceId) => resourceId !== id));
    }
  };

  const handleMultiImageUpload = async (id: string, files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploadingIds((prev) => [...prev, id]);

    try {
      const uploadedUrls = await Promise.all(
        fileList.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || `Upload thất bại với file ${file.name}.`);
          }

          return data.url as string;
        })
      );

      appendResourceImages(id, uploadedUrls);
      setMessage({
        type: "success",
        text: `Đã tải lên ${uploadedUrls.length} ảnh mô tả thành công.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload nhiều ảnh thất bại.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setUploadingIds((prev) => prev.filter((resourceId) => resourceId !== id));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resources),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Không thể lưu tài nguyên.");
      }

      setResources(normalizeResources(data ?? resources));
      setMessage({ type: "success", text: "Đã lưu danh sách tài nguyên miễn phí." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu tài nguyên.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold text-paper outline-none focus:border-paper/30 transition-all placeholder:text-paper/20";
  const textareaClass =
    "w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3.5 px-4 text-[11px] font-bold text-paper outline-none focus:border-paper/30 transition-all placeholder:text-paper/20 min-h-[120px] resize-y";
  const labelClass =
    "text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-2 block";

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-[2.5rem] leading-none font-bold tracking-tight mb-2 uppercase">
            Tài nguyên miễn phí
          </h1>
          <p className="text-paper/40 text-[10px] font-bold uppercase tracking-[0.18em] max-w-xl">
            Quản lý font, brush Procreate và các file free dẫn về Google Drive
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="ui-chip px-4 py-2.5 text-[10px]">
            {resourceCountLabel}
          </div>
          <button
            onClick={addResource}
            className="ui-btn ui-btn-secondary px-4 py-2.5 rounded-xl text-[10px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-paper whitespace-nowrap">Thêm tài nguyên</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ui-btn ui-btn-primary px-5 py-2.5 rounded-xl text-[10px]"
          >
            <Save className="w-3.5 h-3.5 !text-asphalt" />
            <span className="text-asphalt whitespace-nowrap">
              {isSaving ? "Đang lưu..." : "Lưu tài nguyên"}
            </span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-bold ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div key={item} className="h-[420px] rounded-[2rem] bg-paper/5 border border-paper/10 animate-pulse" />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource, index) => {
            const isUploading = uploadingIds.includes(resource.id);
            const previewImage = resource.images[0] || "";
            const currentPanel = activePanel[resource.id] || "content";
            const isExpanded = expandedResourceId === resource.id;
            const panelButtons = [
              { key: "content" as ResourcePanel, icon: PencilLine, label: "Nội dung" },
              { key: "media" as ResourcePanel, icon: ImageIcon, label: "Ảnh mô tả" },
              { key: "drive" as ResourcePanel, icon: Link2, label: "Google Drive" },
            ];

            return (
              <div
                key={resource.id}
                className="bg-paper/5 backdrop-blur-3xl rounded-[1.75rem] border border-paper/10 shadow-2xl overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-16 h-16 rounded-[1rem] overflow-hidden border border-paper/10 bg-paper/5 shrink-0">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt={resource.title || "Resource preview"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-paper/20">
                          <ImagePlus className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF8C00] mb-2">
                        Tài nguyên #{resource.order + 1}
                      </p>
                      <h2 className="text-base font-bold uppercase tracking-tight text-paper truncate">
                        {resource.title || "Tài nguyên mới"}
                      </h2>
                      <p className="text-paper/40 text-[13px] leading-relaxed truncate mt-1">
                        {resource.description || "Chưa có mô tả ngắn."}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="ui-chip px-2.5 py-1.5 text-[10px]">{resource.images.length} ảnh</span>
                        <span className="ui-chip px-2.5 py-1.5 text-[10px]">{resource.category}</span>
                        <span className="ui-chip px-2.5 py-1.5 text-[10px]">
                          {resource.driveUrl ? "Có link Drive" : "Chưa có link"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    <button
                      onClick={() => moveResource(resource.id, "up")}
                      disabled={index === 0}
                      className="p-2.5 rounded-lg border border-paper/10 bg-paper/5 text-paper/40 hover:text-paper hover:bg-paper/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Đưa lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveResource(resource.id, "down")}
                      disabled={index === resources.length - 1}
                      className="p-2.5 rounded-lg border border-paper/10 bg-paper/5 text-paper/40 hover:text-paper hover:bg-paper/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Đưa xuống dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 rounded-[1rem] border border-paper/10 bg-asphalt/30 p-1.5">
                      {panelButtons.map((panel) => (
                        <button
                          key={panel.key}
                          type="button"
                          onClick={() => openResourcePanel(resource.id, panel.key)}
                          className={`p-2.5 rounded-lg transition-all ${
                            isExpanded && currentPanel === panel.key
                              ? "bg-paper text-asphalt"
                              : "bg-transparent text-paper/45 hover:bg-paper/10 hover:text-paper"
                          }`}
                          title={panel.label}
                        >
                          <panel.icon className={`w-3.5 h-3.5 ${isExpanded && currentPanel === panel.key ? "!text-asphalt" : ""}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleExpandedResource(resource.id)}
                      className={`p-2.5 rounded-lg border border-paper/10 transition-all ${
                        isExpanded ? "bg-paper text-asphalt" : "bg-paper/5 text-paper/40 hover:text-paper hover:bg-paper/10"
                      }`}
                      title={isExpanded ? "Thu gọn" : "Mở chi tiết"}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180 !text-asphalt" : ""}`} />
                    </button>
                    <button
                      onClick={() => removeResource(resource.id)}
                      className="p-2.5 rounded-lg border border-paper/10 bg-paper/5 text-paper/30 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-all"
                      title="Xóa tài nguyên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-paper/10 bg-black/10 px-4 lg:px-5 py-4">
                    {currentPanel === "media" && (
                      <div className="rounded-[1.25rem] border border-paper/10 bg-asphalt/35 p-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <p className={labelClass}>Ảnh mô tả popup</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="ui-btn ui-btn-secondary px-3.5 py-2 rounded-xl">
                              <ImagePlus className="w-4 h-4" />
                              <span className="text-paper whitespace-nowrap">
                                {isUploading ? "Đang tải..." : "Upload nhiều ảnh"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  if (e.target.files?.length) {
                                    handleMultiImageUpload(resource.id, e.target.files);
                                  }
                                  e.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => addResourceImage(resource.id)}
                              className="ui-btn ui-btn-secondary px-3.5 py-2 rounded-xl"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-paper whitespace-nowrap">Ảnh mới</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
                          <div className="relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden border border-paper/10 bg-paper/5">
                            {previewImage ? (
                              <Image
                                src={previewImage}
                                alt={resource.title || "Resource preview"}
                                fill
                                sizes="220px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-paper/20 gap-2">
                                <ImagePlus className="w-7 h-7" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Chưa có ảnh</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {(resource.images.length > 0 ? resource.images : [""]).map((image, imageIndex) => (
                              <div
                                key={`${resource.id}-${imageIndex}`}
                                className="rounded-[1.1rem] border border-paper/10 bg-paper/[0.03] p-3"
                              >
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/30">
                                    Ảnh {imageIndex + 1}
                                  </p>
                                  {(resource.images.length > 1 || image) && (
                                    <button
                                      type="button"
                                      onClick={() => removeResourceImage(resource.id, imageIndex)}
                                      className="p-2 rounded-lg text-paper/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                      title="Xóa ảnh"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
                                  <input
                                    className={`${inputClass} flex-1`}
                                    value={image}
                                    onChange={(e) => updateResourceImage(resource.id, imageIndex, e.target.value)}
                                    placeholder="Dán link ảnh mô tả"
                                  />
                                  <label className="ui-btn ui-btn-secondary px-3.5 py-2 rounded-xl xl:shrink-0">
                                    <ImagePlus className="w-4 h-4" />
                                    <span className="text-paper whitespace-nowrap">
                                      {isUploading ? "Đang tải..." : "Upload"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={isUploading}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(resource.id, file, imageIndex);
                                        e.currentTarget.value = "";
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentPanel === "content" && (
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className={labelClass}>Phân loại tài nguyên</label>
                          <select
                            className={inputClass}
                            value={resource.category}
                            onChange={(e) => updateResource(resource.id, "category", e.target.value)}
                          >
                            {RESOURCE_CATEGORIES.map((category) => (
                              <option key={category} value={category} className="bg-asphalt text-paper">
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Tên tài nguyên</label>
                          <input
                            className={inputClass}
                            value={resource.title}
                            onChange={(e) => updateResource(resource.id, "title", e.target.value)}
                            placeholder="Procreate Brush Pack Vol.01"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Mô tả ngắn hiển thị ngoài trang user</label>
                          <input
                            className={inputClass}
                            value={resource.description}
                            onChange={(e) => updateResource(resource.id, "description", e.target.value)}
                            placeholder="Bộ brush mềm dành cho lettering và sketch trên Procreate."
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Mô tả chi tiết trong popup</label>
                          <textarea
                            className={textareaClass}
                            value={resource.detailDescription}
                            onChange={(e) => updateResource(resource.id, "detailDescription", e.target.value)}
                            placeholder="Mô tả rõ tài nguyên gồm những gì, phù hợp với ai, dùng vào việc gì..."
                          />
                        </div>
                      </div>
                    )}

                    {currentPanel === "drive" && (
                      <div>
                        <label className={labelClass}>Link Google Drive</label>
                        <div className="flex flex-col xl:flex-row gap-3">
                          <input
                            className={`${inputClass} flex-1`}
                            value={resource.driveUrl}
                            onChange={(e) => updateResource(resource.id, "driveUrl", e.target.value)}
                            placeholder="https://drive.google.com/..."
                          />
                          {resource.driveUrl && (
                            <a
                              href={resource.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ui-btn ui-btn-secondary px-4 py-3 rounded-2xl xl:shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-paper whitespace-nowrap">Mở link</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-paper/10 bg-paper/5 p-12 text-center">
          <p className="text-paper/30 font-bold uppercase tracking-widest mb-3">Chưa có tài nguyên nào</p>
          <p className="text-paper/20 text-sm mb-6">
            Tạo tài nguyên đầu tiên để hiển thị trên trang free resources cho khách hàng.
          </p>
          <button
            onClick={addResource}
            className="ui-btn ui-btn-primary px-6 py-3 rounded-2xl"
          >
            <Plus className="w-4 h-4 !text-asphalt" />
            <span className="text-asphalt whitespace-nowrap">Thêm tài nguyên đầu tiên</span>
          </button>
        </div>
      )}
    </div>
  );
}
