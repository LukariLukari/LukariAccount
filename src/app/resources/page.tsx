import type { Metadata } from "next";
import { BookOpen, Sparkles } from "lucide-react";
import ResourcesClient from "@/components/ResourcesClient";
import { getBaseUrl, getSiteSettings } from "@/lib/storefront";
import { normalizeResources } from "@/lib/resources";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tài nguyên | LukariAccount",
  description: "Tổng hợp hướng dẫn, tài nguyên và liên kết hỗ trợ dành cho khách hàng LukariAccount.",
  alternates: {
    canonical: `${getBaseUrl()}/resources`,
  },
};

export default async function ResourcesPage() {
  const settings = await getSiteSettings();
  const resources = normalizeResources(settings.resourceLinks);

  return (
    <main className="min-h-screen bg-asphalt text-paper">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
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
            Tổng hợp các video hướng dẫn, tips và liên kết hỗ trợ để khách hàng khai thác sản phẩm hiệu quả hơn.
          </p>
        </div>

        {resources.length > 0 ? (
          <ResourcesClient resources={resources} />
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
