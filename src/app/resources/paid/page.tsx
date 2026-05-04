import type { Metadata } from "next";
import ResourcesClient from "@/components/ResourcesClient";
import { getBaseUrl, getResourcesByMode } from "@/lib/storefront";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Tài nguyên trả phí | LukariAccount",
  alternates: { canonical: `${getBaseUrl()}/resources/paid` },
};

export default async function PaidResourcesPage() {
  const resources = await getResourcesByMode("paid");
  return (
    <main className="min-h-screen bg-asphalt text-paper">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 md:pt-32 md:pb-16">
        <ResourcesClient resources={resources} mode="paid" />
      </div>
    </main>
  );
}
