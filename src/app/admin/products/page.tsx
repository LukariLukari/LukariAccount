"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  Star,
  ShoppingBag,
  Upload,
  HelpCircle,
  CheckCircle,
  FileDown
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";


interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").slice(1); // Skip header
      const productsData = rows.filter(row => row.trim()).map(row => {
        const [name, slug, description, price, originalPrice, billingCycle, image, category] = row.split(",");
        return {
          name: name?.trim(),
          slug: slug?.trim(),
          description: description?.trim(),
          price: price?.trim(),
          originalPrice: originalPrice?.trim(),
          billingCycle: billingCycle?.trim(),
          image: image?.trim(),
          category: category?.trim(),
        };
      });

      try {
        const res = await fetch("/api/admin/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productsData),
        });
        const result = await res.json();
        alert(result.message || result.error);
        fetchProducts();
      } catch (error) {
        alert("Lỗi khi nhập dữ liệu");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to toggle featured status", error);
    }
  };

  const downloadTemplate = () => {
    const headers = "name,slug,description,price,originalPrice,billingCycle,image,category";
    const example = "ChatGPT Plus,chatgpt-plus,Tài khoản ChatGPT Plus chính chủ,499000,599000,tháng,https://example.com/img.png,AI";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lukari_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý sản phẩm</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            {products.length} sản phẩm đang được bày bán
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <label className="flex items-center gap-2 px-8 py-4 bg-paper/10 text-paper border border-paper/10 rounded-2xl font-montserrat font-bold text-[11px] uppercase tracking-widest hover:bg-paper/20 cursor-pointer transition-all shadow-xl">
              <Upload className="w-4 h-4" />
              {isImporting ? "Đang xử lý..." : "Nhập hàng loạt"}
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isImporting} />
            </label>
            <button 
              onClick={() => setShowImportHelp(!showImportHelp)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF8C00] text-asphalt flex items-center justify-center hover:scale-110 transition-all shadow-lg"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showImportHelp && (
              <div className="absolute top-full mt-4 right-0 w-80 bg-[#1a1917] border border-paper/10 rounded-[2rem] p-6 shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-paper mb-3">Hướng dẫn nhập CSV</h3>
                <p className="text-[10px] text-paper/40 font-bold leading-relaxed mb-4">
                  File CSV phải có cấu trúc các cột như sau (ngăn cách bởi dấu phẩy):
                  <br /><br />
                  <code className="text-[#FF8C00] bg-paper/5 p-2 rounded-lg block">
                    name, slug, description, price, originalPrice, billingCycle, image, category
                  </code>
                </p>
                <button 
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-paper/5 hover:bg-paper/10 border border-paper/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-paper transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  Tải file mẫu .csv
                </button>
              </div>
            )}
          </div>
          <Link 
            href="/admin/products/new"
            className="flex items-center gap-2 px-8 py-4 bg-paper text-asphalt rounded-2xl font-montserrat font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-paper/5 backdrop-blur-3xl p-4 rounded-3xl border border-paper/10">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["Tất cả", "AI", "Office", "Design", "OS"].map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${
                selectedCategory === cat 
                ? "bg-paper !text-[#000000] border-paper shadow-[0_0_20px_rgba(239,237,227,0.3)]" 
                : "bg-paper/5 border-paper/10 text-paper/60 hover:text-paper hover:bg-paper/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[3rem] border border-paper/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-paper/10 bg-paper/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Sản phẩm</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Danh mục</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Giá tiền</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-12 bg-paper/5" />
                </tr>
              ))
            ) : filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-paper/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-asphalt border border-paper/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-paper/20" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-tight">{product.name}</h3>
                      <p className="text-[9px] text-paper/20 font-mono">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-paper/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-paper/60">
                    {product.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#FF8C00]">
                      {formatPrice(product.price)}₫
                    </span>
                    {product.isBestSeller && (
                      <div className="flex items-center gap-1 text-yellow-500 mt-1">
                        <Star className="w-2.5 h-2.5 fill-yellow-500" />
                        <span className="text-[7px] font-bold uppercase">Bán chạy</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => toggleFeatured(product.id, product.isFeatured)}
                      title={product.isFeatured ? "Bỏ khỏi trang chủ" : "Đưa lên trang chủ"}
                      className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 group/btn ${
                        product.isFeatured 
                        ? "bg-[#FF8C00] text-asphalt border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.4)]" 
                        : "bg-paper/5 text-paper/40 border-paper/5 hover:text-paper hover:bg-paper/10"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${product.isFeatured ? "fill-asphalt" : ""}`} />
                      {product.isFeatured && <span className="text-[9px] font-bold uppercase tracking-widest">Nổi bật</span>}
                    </button>
                    <Link 
                      href={`/admin/products/${product.id}`}
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-paper text-paper/40 hover:text-asphalt transition-all border border-paper/5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button className="p-2.5 rounded-xl bg-paper/5 hover:bg-red-500/10 text-paper/40 hover:text-red-500 transition-all border border-paper/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link 
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 text-paper/40 transition-all border border-paper/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-paper/20 font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
