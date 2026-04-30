"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  if (isLoading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-paper/20">Đang tải dữ liệu...</div>;
  if (!product) return <div className="p-10 text-center font-bold uppercase tracking-widest text-red-400">Không tìm thấy sản phẩm</div>;

  return (
    <div className="pt-6">
      <ProductForm initialData={product} productId={params.id as string} />
    </div>
  );
}
