import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Tài nguyên | LukariAccount",
  description: "Chọn tài nguyên miễn phí hoặc tài nguyên trả phí.",
  alternates: { canonical: `${getBaseUrl()}/resources` },
};

export default function ResourcesHubPage() {
  redirect("/resources/free");
}
