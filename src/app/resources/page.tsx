"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Play, BookOpen, Sparkles } from "lucide-react";

interface ResourceLink {
  title: string;
  url: string;
  platform: string;
  description: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceLink[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.resourceLinks && Array.isArray(data.resourceLinks)) {
          setResources(data.resourceLinks);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchResources();
  }, []);

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok": return "from-pink-500/20 to-purple-500/20 border-pink-500/20 hover:border-pink-500/40";
      case "youtube": return "from-red-500/20 to-orange-500/20 border-red-500/20 hover:border-red-500/40";
      case "facebook": return "from-blue-500/20 to-indigo-500/20 border-blue-500/20 hover:border-blue-500/40";
      case "instagram": return "from-purple-500/20 to-pink-500/20 border-purple-500/20 hover:border-purple-500/40";
      case "telegram": return "from-cyan-500/20 to-blue-500/20 border-cyan-500/20 hover:border-cyan-500/40";
      default: return "from-paper/5 to-paper/10 border-paper/10 hover:border-paper/20";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
      case "youtube": return <Play className="w-5 h-5" />;
      case "facebook":
      case "instagram":
      case "telegram": return <ExternalLink className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <main className="min-h-screen bg-asphalt text-paper">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#FF8C00]" />
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-[#FF8C00]">
              Miễn phí 100%
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-montserrat font-bold tracking-tight uppercase mb-4">
            Tài nguyên miễn phí
          </h1>
          <p className="text-paper/40 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Tổng hợp các video hướng dẫn, tips & tricks, và tài liệu miễn phí giúp bạn khai thác tối đa phần mềm.
          </p>
        </motion.div>

        {/* Resource Grid */}
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, idx) => (
              <motion.a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group block bg-gradient-to-br ${getPlatformColor(resource.platform)} border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-paper/5 text-paper/60 group-hover:bg-paper group-hover:text-asphalt transition-all duration-300">
                    {getPlatformIcon(resource.platform)}
                  </div>
                  <span className="text-[9px] font-montserrat font-bold uppercase tracking-widest text-paper/30 px-3 py-1 bg-paper/5 rounded-full border border-paper/5">
                    {resource.platform}
                  </span>
                </div>
                <h3 className="font-montserrat font-bold text-lg text-paper uppercase tracking-tight mb-2 group-hover:text-[#FF8C00] transition-colors">
                  {resource.title}
                </h3>
                <p className="text-paper/40 text-xs font-bold leading-relaxed">
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-paper/20 group-hover:text-paper/60 text-[10px] font-bold uppercase tracking-widest transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  Xem ngay
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-paper/10 mx-auto mb-6" />
            <p className="text-paper/30 font-bold uppercase tracking-widest text-sm mb-2">
              Chưa có tài nguyên nào
            </p>
            <p className="text-paper/20 text-xs">
              Admin có thể thêm tài nguyên trong trang quản trị.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
