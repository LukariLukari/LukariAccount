import type { Metadata } from "next";
import ResourcesClient from "@/components/ResourcesClient";
import { getBaseUrl, getResourcesByMode } from "@/lib/storefront";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Tài nguyên miễn phí | LukariAccount",
  alternates: { canonical: `${getBaseUrl()}/resources/free` },
};

export default async function FreeResourcesPage() {
  const resources = await getResourcesByMode("free");
  return (
    <main className="min-h-screen bg-asphalt text-paper">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <ResourcesClient resources={resources} mode="free" />
      </div>
    </main>
  );
}
