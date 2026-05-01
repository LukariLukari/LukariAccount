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
  Search,
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
  const [bulkDriveLinks, setBulkDriveLinks] = useState("");
  const [bulkCategory, setBulkCategory] = useState<(typeof RESOURCE_CATEGORIES)[number]>("Khác");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Tất cả");

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

  const filteredResources = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory = categoryFilter === "Tất cả" || resource.category === categoryFilter;
      const searchableText = [
        resource.title,
        resource.description,
        resource.detailDescription,
        resource.category,
        resource.driveUrl,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, resources, searchQuery]);

  const resourceStats = useMemo(() => {
    const withDrive = resources.filter((resource) => resource.driveUrl.trim().length > 0).length;
    const withImages = resources.filter((resource) => resource.images.length > 0).length;

    return {
      withDrive,
      withImages,
      missingDrive: resources.length - withDrive,
    };
  }, [resources]);

  const bulkDriveItems = useMemo(() => {
    const seenLinks = new Set<string>();

    return bulkDriveLinks
      .split(/\r?\n/)
      .map((line) => {
        const trimmedLine = line.trim();
        const driveUrl = trimmedLine.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, "") ?? "";
        const isGoogleDriveUrl = (() => {
          try {
            const hostname = new URL(driveUrl).hostname;
            return hostname === "drive.google.com" || hostname.endsWith(".drive.google.com") || hostname === "docs.google.com";
          } catch {
            return false;
          }
        })();
        const titleParts = trimmedLine
          .split("|")
          .map((part) => part.trim())
          .filter((part) => part.length > 0 && part !== driveUrl);
        const titleFromPipe =
          titleParts.find((part) => !part.startsWith("http://") && !part.startsWith("https://")) ?? "";

        return {
          driveUrl,
          isGoogleDriveUrl,
          title: titleFromPipe,
        };
      })
      .filter((item) => {
        if (!item.isGoogleDriveUrl || seenLinks.has(item.driveUrl)) return false;
        seenLinks.add(item.driveUrl);
        return true;
      });
  }, [bulkDriveLinks]);

  const updateResource = <K extends keyof FreeResource>(id: string, field: K, value: FreeResource[K]) => {
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

  const addBulkDriveResources = () => {
    if (bulkDriveItems.length === 0) {
      setMessage({ type: "error", text: "Hãy nhập ít nhất 1 link Google Drive hợp lệ." });
      return;
    }

    const existingLinks = new Set(resources.map((resource) => resource.driveUrl.trim()).filter(Boolean));
    const uniqueItems = bulkDriveItems.filter((item) => !existingLinks.has(item.driveUrl));

    if (uniqueItems.length === 0) {
      setMessage({ type: "error", text: "Các link này đã có trong danh sách tài nguyên." });
      return;
    }

    const newResources = uniqueItems.map((item, index) => {
      const nextResource = createEmptyResource();
      const title = item.title || `Tài nguyên Drive ${resources.length + index + 1}`;

      return {
        ...nextResource,
        category: bulkCategory,
        title,
        description: "Tài nguyên miễn phí tải qua Google Drive.",
        detailDescription: "Tài nguyên miễn phí tải qua Google Drive.",
        driveUrl: item.driveUrl,
        isPaid: false,
        price: 0,
      };
    });

    setResources((prev) => reindexResources([...prev, ...newResources]));
    setExpandedResourceId(newResources[0].id);
    setActivePanel((prev) => ({
      ...prev,
      ...Object.fromEntries(newResources.map((resource) => [resource.id, "content" as ResourcePanel])),
    }));
    setBulkDriveLinks("");
    setMessage({
      type: "success",
      text: `Đã thêm ${newResources.length} tài nguyên từ link Drive. Bấm "Lưu tài nguyên" để lưu vào hệ thống.`,
    });
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
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] lg:text-[2rem] leading-[0.95] font-bold tracking-tight mb-2 uppercase">
            Tài nguyên
          </h1>
          <p className="text-paper/40 text-[9px] font-bold uppercase tracking-[0.16em] max-w-xl">
            Quản lý font, brush Procreate và các file free dẫn về Google Drive
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={addResource}
            className="ui-btn ui-btn-secondary px-3 py-1.5 rounded-xl text-[8px]"
          >
            <Plus className="w-2.5 h-2.5" />
            <span className="text-paper whitespace-nowrap">Thêm tài nguyên</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ui-btn ui-btn-primary px-3.5 py-1.5 rounded-xl text-[8px]"
          >
            <Save className="w-2.5 h-2.5 !text-asphalt" />
            <span className="text-asphalt whitespace-nowrap">
              {isSaving ? "Đang lưu..." : "Lưu tài nguyên"}
            </span>
          </button>
        </div>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { label: "Tổng", value: resources.length },
            { label: "Có Drive", value: resourceStats.withDrive },
            { label: "Có ảnh", value: resourceStats.withImages },
            { label: "Thiếu Drive", value: resourceStats.missingDrive },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-paper/10 bg-paper/[0.04] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-paper/30 mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-paper">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {!isLoading && (
        <div className="rounded-[1.25rem] border border-paper/10 bg-paper/[0.04] p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#FF8C00] mb-1">
                Thêm hàng loạt
              </p>
              <h2 className="text-base font-bold uppercase tracking-tight text-paper">
                Nhập nhiều link Google Drive
              </h2>
            </div>
            <div className="ui-chip px-3.5 py-2 text-[9px]">
              {bulkDriveItems.length} link hợp lệ
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[150px_minmax(0,1fr)_auto] gap-3 lg:items-end">
            <div className="max-w-[150px]">
              <label className={labelClass}>Phân loại mặc định</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none py-2.5 pl-3 pr-9`}
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value as (typeof RESOURCE_CATEGORIES)[number])}
                >
                  {RESOURCE_CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-asphalt text-paper">
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/70" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Mỗi dòng 1 link, hoặc: Tên tài nguyên | link</label>
              <textarea
                className={`${textareaClass} min-h-[82px] max-h-[180px]`}
                value={bulkDriveLinks}
                onChange={(e) => setBulkDriveLinks(e.target.value)}
                placeholder={`https://drive.google.com/file/d/...\nBộ brush watercolor | https://drive.google.com/drive/folders/...`}
              />
            </div>

            <button
              type="button"
              onClick={addBulkDriveResources}
              className="ui-btn ui-btn-primary px-4 py-3 rounded-2xl"
            >
              <Plus className="w-4 h-4 !text-asphalt" />
              <span className="text-asphalt whitespace-nowrap">Tạo hàng loạt</span>
            </button>
          </div>
        </div>
      )}

      {!isLoading && resources.length > 0 && (
        <div className="rounded-[1.25rem] border border-paper/10 bg-paper/[0.04] p-3">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/25" />
              <input
                className={`${inputClass} pl-10`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, mô tả, link Drive..."
              />
            </div>
            <select
              className={inputClass}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="Tất cả" className="bg-asphalt text-paper">Tất cả phân loại</option>
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-asphalt text-paper">
                  {category}
                </option>
              ))}
            </select>
            <div className="ui-chip flex items-center justify-center px-3.5 py-2 text-[9px]">
              {filteredResources.length}/{resources.length} đang hiển thị
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div key={item} className="h-[420px] rounded-[2rem] bg-paper/5 border border-paper/10 animate-pulse" />
          ))}
        </div>
      ) : resources.length > 0 ? (
        filteredResources.length > 0 ? (
        <div className="space-y-2">
          {filteredResources.map((resource) => {
            const resourceIndex = resources.findIndex((item) => item.id === resource.id);
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
                className="bg-paper/[0.04] backdrop-blur-3xl rounded-[1.15rem] border border-paper/10 overflow-hidden"
              >
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-3 p-3">
                  <div className="grid grid-cols-[48px_minmax(0,1fr)] md:grid-cols-[48px_72px_minmax(0,1fr)_120px_90px] items-center gap-3 min-w-0">
                    <p className="hidden md:block text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                      #{resource.order + 1}
                    </p>
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-paper/10 bg-paper/5 shrink-0">
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
                          <ImagePlus className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="md:hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF8C00] mb-1">
                        #{resource.order + 1}
                      </p>
                      <h2 className="text-sm font-bold uppercase tracking-tight text-paper truncate">
                        {resource.title || "Tài nguyên mới"}
                      </h2>
                      <p className="text-paper/40 text-[12px] leading-relaxed truncate mt-1">
                        {resource.description || "Chưa có mô tả ngắn."}
                      </p>
                    </div>

                    <div className="hidden md:flex min-w-0 justify-start">
                      <span className="ui-chip px-2.5 py-1.5 text-[9px] truncate max-w-full">{resource.category}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-[11px] font-bold text-paper/50">{resource.images.length} ảnh</span>
                      <span className={`h-2 w-2 rounded-full ${resource.driveUrl ? "bg-green-400" : "bg-red-400"}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap xl:justify-end">
                    <button
                      onClick={() => moveResource(resource.id, "up")}
                      disabled={resourceIndex <= 0}
                      className="p-2.5 rounded-lg border border-paper/10 bg-paper/5 text-paper/40 hover:text-paper hover:bg-paper/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Đưa lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveResource(resource.id, "down")}
                      disabled={resourceIndex === resources.length - 1}
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

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-3">
                          <label className="flex items-center gap-2 rounded-xl border border-paper/10 bg-asphalt/50 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={resource.isPaid}
                              onChange={(e) => {
                                const isPaid = e.target.checked;
                                updateResource(resource.id, "isPaid", isPaid);
                                if (!isPaid) updateResource(resource.id, "price", 0);
                              }}
                            />
                            <span className="text-[11px] font-bold text-paper">Tài nguyên tính phí</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            disabled={!resource.isPaid}
                            className={inputClass}
                            value={resource.price}
                            onChange={(e) =>
                              updateResource(resource.id, "price", Math.max(0, Number(e.target.value) || 0))
                            }
                            placeholder="Giá bán bằng số dư ví"
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
        <div className="rounded-[1.25rem] border border-paper/10 bg-paper/[0.04] p-10 text-center">
          <p className="text-paper/30 font-bold uppercase tracking-widest mb-3">Không có kết quả phù hợp</p>
          <p className="text-paper/20 text-sm">
            Thử đổi từ khóa tìm kiếm hoặc chọn lại phân loại.
          </p>
        </div>
      )
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
