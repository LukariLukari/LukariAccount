"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, X } from "lucide-react";
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

  const activeImageCount = activeResource?.images.length || 0;
  const canNavigateImages = activeImageCount > 1;

  const goToImage = (direction: "prev" | "next") => {
    if (!activeImageCount) return;
    setActiveImageIndex((currentIndex) => {
      const offset = direction === "next" ? 1 : -1;
      return (currentIndex + offset + activeImageCount) % activeImageCount;
    });
  };

  useEffect(() => {
    if (!activeResource) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveResource(null);
        return;
      }
      if (!canNavigateImages) return;
      if (event.key === "ArrowLeft") goToImage("prev");
      if (event.key === "ArrowRight") goToImage("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeResource, canNavigateImages, activeImageCount]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7 lg:mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`px-4 py-2.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.18em] transition-all ${
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group flex h-[214px] flex-col rounded-[1.5rem] border border-paper/10 bg-gradient-to-br from-paper/5 to-paper/[0.02] p-4 transition-all duration-300 hover:border-paper/20 hover:shadow-2xl"
          >
            <div className="flex min-h-0 flex-1 items-start gap-3">
              <div className="relative w-16 h-16 rounded-[1rem] overflow-hidden border border-paper/10 bg-paper/5 shrink-0 shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
                {resource.images[0] ? (
                  <Image
                    src={resource.images[0]}
                    alt={resource.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-paper/20 text-[10px] font-bold uppercase tracking-widest">
                    No Img
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF8C00] mb-1.5">
                  #{resource.order + 1} • {resource.category}
                </p>
                <h2 className="font-montserrat font-bold text-base text-paper uppercase tracking-tight mb-1.5 truncate">
                  {resource.title}
                </h2>
                <p className="text-paper/45 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {resource.description}
                </p>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
              <button
                onClick={() => openResource(resource)}
                className={`ui-btn ui-btn-primary px-3 py-2.5 min-w-0 rounded-xl text-[8px] ${resource.driveUrl ? "" : "col-span-2"}`}
              >
                <Eye className="w-3.5 h-3.5 !text-asphalt" />
                <span className="text-asphalt whitespace-nowrap">Chi tiết</span>
              </button>
              {resource.driveUrl && (
                <a
                  href={resource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn ui-btn-secondary px-3 py-2.5 min-w-0 rounded-xl text-[8px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
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
                <motion.div
                  className="relative min-h-[320px] overflow-hidden bg-paper/5 lg:min-h-[560px]"
                  drag={canNavigateImages ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (!canNavigateImages) return;
                    const swipeDistance = Math.abs(info.offset.x);
                    const swipeVelocity = Math.abs(info.velocity.x);
                    if (swipeDistance > 60 || swipeVelocity > 500) {
                      goToImage(info.offset.x < 0 ? "next" : "prev");
                    }
                  }}
                >
                  {activeResource.images[activeImageIndex] ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeResource.images[activeImageIndex]}
                        initial={{ opacity: 0, scale: 1.015 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.985 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={activeResource.images[activeImageIndex]}
                          alt={activeResource.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-paper/20 text-sm font-bold uppercase tracking-widest">
                      Chưa có ảnh mô tả
                    </div>
                  )}

                  {canNavigateImages && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToImage("prev")}
                        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/15 bg-black/45 text-paper/70 backdrop-blur-md transition hover:bg-paper hover:text-asphalt"
                        aria-label="Ảnh trước"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToImage("next")}
                        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/15 bg-black/45 text-paper/70 backdrop-blur-md transition hover:bg-paper hover:text-asphalt"
                        aria-label="Ảnh sau"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-paper/10 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-paper/70 backdrop-blur-md">
                        {activeImageIndex + 1} / {activeImageCount}
                      </div>
                    </>
                  )}
                </motion.div>

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
