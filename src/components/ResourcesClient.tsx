"use client";

import { useState } from "react";
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

  const openResource = (resource: FreeResource) => {
    setActiveResource(resource);
    setActiveImageIndex(0);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="group rounded-[2rem] border border-paper/10 bg-gradient-to-br from-paper/5 to-paper/[0.02] p-6 transition-all duration-300 hover:border-paper/20 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-montserrat font-bold text-lg text-paper uppercase tracking-tight mb-2">
                  {resource.title}
                </h2>
                <p className="text-paper/40 text-sm leading-relaxed">
                  {resource.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => openResource(resource)}
                className="ui-btn ui-btn-primary px-5 py-3 min-w-[170px]"
              >
                <Eye className="w-4 h-4 !text-asphalt" />
                <span className="text-asphalt whitespace-nowrap">Chi tiết</span>
              </button>
              {resource.driveUrl && (
                <a
                  href={resource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn ui-btn-secondary px-5 py-3 min-w-[170px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-paper whitespace-nowrap">Mở Drive</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

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
