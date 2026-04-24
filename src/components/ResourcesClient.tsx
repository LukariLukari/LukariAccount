"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, X } from "lucide-react";
import type { FreeResource } from "@/lib/resources";

interface ResourcesClientProps {
  resources: FreeResource[];
}

export default function ResourcesClient({ resources }: ResourcesClientProps) {
  const [activeResource, setActiveResource] = useState<FreeResource | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const categories = useMemo(() => {
    return ["Tất cả", ...Array.from(new Set(resources.map((resource) => resource.category)))];
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (selectedCategory === "Tất cả") return resources;
    return resources.filter((resource) => resource.category === selectedCategory);
  }, [resources, selectedCategory]);

  const openResource = (resource: FreeResource) => {
    setActiveResource(resource);
    setActiveImageIndex(0);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`px-5 py-3 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              selectedCategory === category
                ? ""
                : "bg-paper/5 border-paper/10 hover:bg-paper/10 hover:border-paper/20"
            }`}
            style={
              selectedCategory === category
                ? {
                    backgroundColor: "var(--paper)",
                    color: "var(--asphalt)",
                    borderColor: "var(--paper)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                  }
                : undefined
            }
          >
            <span
              className={selectedCategory === category ? "text-asphalt whitespace-nowrap" : "text-paper/60 whitespace-nowrap"}
            >
              {category}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group rounded-[2rem] border border-paper/10 bg-gradient-to-br from-paper/5 to-paper/[0.02] p-5 transition-all duration-300 hover:border-paper/20 hover:shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="relative w-24 h-24 rounded-[1.25rem] overflow-hidden border border-paper/10 bg-paper/5 shrink-0 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
                {resource.images[0] ? (
                  <Image
                    src={resource.images[0]}
                    alt={resource.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-paper/20 text-[10px] font-bold uppercase tracking-widest">
                    No Img
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#FF8C00] mb-2">
                  #{resource.order + 1} • {resource.category}
                </p>
                <h2 className="font-montserrat font-bold text-xl text-paper uppercase tracking-tight mb-2 truncate">
                  {resource.title}
                </h2>
                <p className="text-paper/45 text-[15px] leading-relaxed line-clamp-2">
                  {resource.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => openResource(resource)}
                className="ui-btn ui-btn-primary px-4 py-2.5 min-w-[156px] rounded-xl text-[11px]"
              >
                <Eye className="w-4 h-4 !text-asphalt" />
                <span className="text-asphalt whitespace-nowrap">Chi tiết</span>
              </button>
              {resource.driveUrl && (
                <a
                  href={resource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn ui-btn-secondary px-4 py-2.5 min-w-[156px] rounded-xl text-[11px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-paper whitespace-nowrap">Mở Drive</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-20 border border-paper/10 rounded-[2rem] bg-paper/5">
          <p className="text-paper/30 font-bold uppercase tracking-widest text-sm mb-2">
            Chưa có tài nguyên trong mục này
          </p>
          <p className="text-paper/20 text-xs">
            Hãy chọn danh mục khác hoặc thêm tài nguyên mới trong trang quản trị.
          </p>
        </div>
      )}

      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setActiveResource(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              className="relative z-10 w-full max-w-4xl rounded-[2.5rem] border border-paper/10 bg-[#1a1917] shadow-[0_40px_80px_rgba(0,0,0,0.45)] overflow-hidden"
            >
              <button
                onClick={() => setActiveResource(null)}
                className="absolute top-5 right-5 z-20 p-3 rounded-full bg-black/40 text-paper/60 hover:text-paper hover:bg-black/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[320px] lg:min-h-[560px] bg-paper/5">
                  {activeResource.images[activeImageIndex] ? (
                    <Image
                      src={activeResource.images[activeImageIndex]}
                      alt={activeResource.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-paper/20 text-sm font-bold uppercase tracking-widest">
                      Chưa có ảnh mô tả
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-10 flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF8C00] mb-3">
                    Free Resource
                  </p>
                  <h3 className="text-3xl font-montserrat font-bold uppercase tracking-tight text-paper mb-4">
                    {activeResource.title}
                  </h3>
                  <p className="text-paper/55 text-sm leading-relaxed whitespace-pre-line">
                    {activeResource.detailDescription || activeResource.description}
                  </p>

                  {activeResource.images.length > 1 && (
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-paper/30 mb-3">
                        Hình mô tả
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {activeResource.images.map((image, index) => (
                          <button
                            key={`${activeResource.id}-${index}`}
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative w-16 h-16 rounded-2xl overflow-hidden border transition-all ${
                              activeImageIndex === index
                                ? "border-[#FF8C00] shadow-[0_0_0_1px_rgba(255,140,0,0.45)]"
                                : "border-paper/10 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${activeResource.title} preview ${index + 1}`}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-8">
                    {activeResource.driveUrl && (
                      <a
                        href={activeResource.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui-btn ui-btn-primary px-6 py-4"
                      >
                        <ExternalLink className="w-4 h-4 !text-asphalt" />
                        <span className="text-asphalt whitespace-nowrap">Đi tới Google Drive</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
