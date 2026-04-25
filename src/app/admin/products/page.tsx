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
  FileDown,
  Zap,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/data";

export default function AdminProductsPage() {
  type Toast = {
    id: number;
    title: string;
    message: string;
    type: "success" | "error";
  };
  type ImportPreviewProduct = {
    name: string;
    slug: string;
    description: string;
    price: string;
    originalPrice: string;
    billingCycle: string;
    image: string;
    category: string;
    details: string;
    features: string[];
    instructions: string[];
    warranty: string;
    plans: { label: string; price: number; cycle: string }[];
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewProduct[]>([]);
  const [pendingProductIds, setPendingProductIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ isOpen: true, title, message, onConfirm });
  const showToast = (title: string, message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };
  const markProductPending = (id: string, isPending: boolean) => {
    setPendingProductIds((prev) => {
      if (isPending) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((productId) => productId !== id);
    });
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
    };
    init();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories/config");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

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
  const parseCSVRow = (row: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").slice(1); // Skip header
      const productsData = rows.filter(row => row.trim()).map(row => {
        const [
          name, slug, description, price, originalPrice, billingCycle, image, category, 
          details, features, instructions, warranty, plansStr
        ] = parseCSVRow(row.trim());
        
        return {
          name: name?.trim(),
          slug: slug?.trim(),
          description: description?.trim(),
          price: price?.trim(),
          originalPrice: originalPrice?.trim() || "0",
          billingCycle: billingCycle?.trim() || "tháng",
          image: image?.trim(),
          category: category?.trim() || "AI",
          details: details?.trim() || "",
          features: features ? features.split("|").map(f => f.trim()) : [],
          instructions: instructions ? instructions.split("|").map(i => i.trim()) : [],
          warranty: warranty?.trim() || "",
          plans: plansStr ? plansStr.split("|").map(plan => {
            const [label, p, cycle] = plan.split(":");
            return { label: label?.trim() || "Gói", price: Number(p) || 0, cycle: cycle?.trim() || "tháng" };
          }) : []
        };
      });

      setImportPreview(productsData.filter((item) => item.name && item.slug));
      setIsImporting(false);
      e.target.value = "";
    };
    reader.onerror = () => {
      setIsImporting(false);
      showToast("Lỗi", "Không thể đọc file CSV.", "error");
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const confirmImportProducts = async () => {
    if (importPreview.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importPreview),
      });
      const result = await res.json();
      showToast(res.ok ? "Thành công" : "Lỗi", result.message || result.error, res.ok ? "success" : "error");
      if (res.ok) {
        setImportPreview([]);
        fetchProducts();
      }
    } catch (error) {
      showToast("Lỗi", "Lỗi khi nhập dữ liệu", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBestSeller = async (id: string, current: boolean) => {
    const nextValue = !current;
    const previousProducts = products;
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, isBestSeller: nextValue } : product
      )
    );
    markProductPending(id, true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBestSeller: nextValue }),
      });
      if (res.ok) {
        showToast("Thành công", nextValue ? "Đã thêm vào mục bán chạy." : "Đã gỡ khỏi mục bán chạy.");
      } else {
        const data = await res.json().catch(() => null);
        setProducts(previousProducts);
        showToast("Lỗi", data?.error || "Không thể cập nhật trạng thái bán chạy.", "error");
      }
    } catch (error) {
      setProducts(previousProducts);
      console.error("Failed to toggle best seller status", error);
      showToast("Lỗi", "Không thể cập nhật trạng thái bán chạy.", "error");
    } finally {
      markProductPending(id, false);
    }
  };

  const downloadTemplate = () => {
    const headers = "name,slug,description,price,originalPrice,billingCycle,image,category,details,features,instructions,warranty,plans";
    const example = '"ChatGPT Plus","chatgpt-plus","Tài khoản ChatGPT Plus chính chủ","499000","599000","tháng","https://example.com/img.png","AI","Chi tiết dài ở đây...","Tính năng 1|Tính năng 2","Bước 1|Bước 2","Bảo hành 1 đổi 1","1 Tháng:499000:tháng|6 Tháng:2500000:6 tháng"';
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lukari_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    showConfirm("Xác nhận xóa hàng loạt", `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm? Hành động này không thể hoàn tác.`, async () => {
      setIsBulkUpdating(true);
      const idsToDelete = [...selectedIds];
      try {
        const res = await fetch("/api/admin/products/bulk-update", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        if (res.ok) {
          setProducts((prev) => prev.filter((product) => !idsToDelete.includes(product.id)));
          setSelectedIds([]);
          showToast("Thành công", `Đã xóa ${idsToDelete.length} sản phẩm.`);
        } else {
          const data = await res.json().catch(() => null);
          showToast("Lỗi", data?.error || "Không thể xóa hàng loạt.", "error");
        }
      } catch (error) {
        showToast("Lỗi", "Đã xảy ra lỗi khi xóa.", "error");
      } finally {
        setIsBulkUpdating(false);
      }
    });
  };

  const handleDeleteSingle = (id: string, name: string) => {
    showConfirm("Xác nhận xóa", `Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`, async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          setProducts((prev) => prev.filter((product) => product.id !== id));
          setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
          showToast("Thành công", `Đã xóa sản phẩm "${name}".`);
        } else {
          const data = await res.json().catch(() => null);
          showToast("Lỗi", data?.error || "Không thể xóa sản phẩm.", "error");
        }
      } catch (error) {
        showToast("Lỗi", "Đã xảy ra lỗi khi xóa.", "error");
      }
    });
  };

  const updateProductCategory = async (id: string, newCategory: string) => {
    const previousProducts = products;
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, category: newCategory } : product
      )
    );
    markProductPending(id, true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      if (res.ok) {
        showToast("Thành công", `Đã chuyển sản phẩm sang danh mục "${newCategory}".`);
      } else {
        const data = await res.json().catch(() => null);
        setProducts(previousProducts);
        showToast("Lỗi", data?.error || "Không thể cập nhật danh mục.", "error");
      }
    } catch (error) {
      setProducts(previousProducts);
      console.error("Failed to update category", error);
      showToast("Lỗi", "Không thể cập nhật danh mục.", "error");
    } finally {
      markProductPending(id, false);
    }
  };

  const handleBulkBestSeller = async (status: boolean) => {
    setIsBulkUpdating(true);
    const idsToUpdate = [...selectedIds];
    const previousProducts = products;
    setProducts((prev) =>
      prev.map((product) =>
        idsToUpdate.includes(product.id) ? { ...product, isBestSeller: status } : product
      )
    );

    try {
      const res = await fetch("/api/admin/products/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToUpdate, data: { isBestSeller: status } }),
      });
      if (res.ok) {
        setSelectedIds([]);
        showToast("Thành công", status ? "Đã cập nhật mục bán chạy cho các sản phẩm đã chọn." : "Đã gỡ mục bán chạy cho các sản phẩm đã chọn.");
      } else {
        const data = await res.json().catch(() => null);
        setProducts(previousProducts);
        showToast("Lỗi", data?.error || "Không thể cập nhật trạng thái bán chạy.", "error");
      }
    } catch (error) {
      setProducts(previousProducts);
      showToast("Lỗi", "Lỗi khi cập nhật hàng loạt", "error");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-10 relative">
      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-5 lg:bottom-10 left-1/2 z-50 max-w-[calc(100vw-1.5rem)] overflow-x-auto bg-paper text-asphalt px-4 lg:px-8 py-3 lg:py-4 rounded-[2rem] lg:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-paper/20 flex items-center gap-4 lg:gap-8 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 lg:gap-4 pr-4 lg:pr-8 border-r border-asphalt/10 shrink-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-asphalt text-paper flex items-center justify-center font-akina font-black text-lg lg:text-xl">
                {selectedIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Đã chọn</span>
                <span className="text-[12px] font-bold uppercase tracking-widest">Sản phẩm</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <button 
                onClick={() => handleBulkBestSeller(true)}
                disabled={isBulkUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-asphalt/5 hover:bg-asphalt/10 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-asphalt" />
                Đẩy Bán chạy
              </button>
              <button 
                onClick={() => handleBulkBestSeller(false)}
                disabled={isBulkUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-asphalt/5 hover:bg-asphalt/10 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Gỡ Bán chạy
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={isBulkUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Xóa mục đã chọn
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="ml-6 p-2 rounded-full hover:bg-asphalt/5 transition-all"
                title="Hủy chọn"
              >
                <CheckCircle className="w-5 h-5 opacity-20 hover:opacity-100" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý sản phẩm</h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            {products.length} sản phẩm đang được bày bán
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 sm:items-center">
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
              <div className="absolute top-full mt-4 right-0 w-[400px] bg-[#1a1917] border border-paper/10 rounded-[2rem] p-6 shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-paper mb-3">Hướng dẫn nhập CSV nâng cao</h3>
                <div className="text-[10px] text-paper/60 font-medium leading-relaxed mb-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  <p>File CSV hỗ trợ các cột (ngăn cách bởi dấu phẩy):</p>
                  <code className="text-[#FF8C00] bg-paper/5 p-2 rounded-lg block font-bold text-[9px] break-all">
                    name, slug, description, price, originalPrice, billingCycle, image, category, details, features, instructions, warranty, plans
                  </code>
                  <div className="bg-paper/5 p-3 rounded-xl mt-3 space-y-2">
                    <p><strong className="text-paper">Lưu ý định dạng:</strong></p>
                    <ul className="list-disc pl-4 space-y-1 text-paper/40">
                      <li><strong>features / instructions:</strong> Dùng dấu gạch đứng <code className="text-[#FF8C00]">|</code> để ngăn cách các dòng. VD: <code className="bg-black/20 p-1">Tính năng 1 | Tính năng 2</code></li>
                      <li><strong>plans:</strong> Format <code className="bg-black/20 p-1">Tên:Giá:Kỳ hạn</code> và ngăn cách bởi <code className="text-[#FF8C00]">|</code>. VD: <code className="bg-black/20 p-1">1 Tháng:499000:tháng | 6 Tháng:2500000:6 tháng</code></li>
                      <li>Dùng dấu ngoặc kép <code className="text-[#FF8C00]">""</code> bao quanh nội dung nếu bên trong có chứa dấu phẩy <code className="text-[#FF8C00]">,</code> (VD: <code className="bg-black/20 p-1">"Chi tiết 1, Chi tiết 2"</code>).</li>
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-paper/10 hover:bg-paper/20 border border-paper/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-paper transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  Tải file mẫu .csv
                </button>
              </div>
            )}
          </div>
          <Link 
            href="/admin/products/new"
            className="flex items-center gap-2 px-8 py-4 bg-paper !text-asphalt rounded-2xl font-montserrat font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4 !text-asphalt" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

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
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {["Tất cả", ...categories].map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                selectedCategory === cat 
                ? "bg-paper !text-asphalt border-paper shadow-[0_0_20px_rgba(239,237,227,0.3)]" 
                : "bg-paper/5 border-paper/10 text-paper/60 hover:text-paper hover:bg-paper/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3rem] border border-paper/10 overflow-x-auto shadow-2xl">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-paper/10 bg-paper/5">
              <th className="px-8 py-6 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-paper/20 bg-asphalt checked:bg-[#FF8C00] transition-all cursor-pointer"
                />
              </th>
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
                  <td colSpan={5} className="px-8 py-12 bg-paper/5" />
                </tr>
              ))
            ) : filteredProducts.map((product) => (
              <tr 
                key={product.id} 
                className={`hover:bg-paper/5 transition-all group ${selectedIds.includes(product.id) ? 'bg-[#FF8C00]/5' : ''}`}
              >
                <td className="px-8 py-6">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelectOne(product.id)}
                    className="w-4 h-4 rounded border-paper/20 bg-asphalt checked:bg-[#FF8C00] transition-all cursor-pointer"
                  />
                </td>
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
                  <select 
                    value={product.category}
                    onChange={(e) => updateProductCategory(product.id, e.target.value)}
                    disabled={pendingProductIds.includes(product.id)}
                    className="bg-paper/10 hover:bg-paper/20 border border-paper/10 rounded-full py-1.5 px-4 text-[9px] font-bold uppercase tracking-widest text-paper/60 outline-none transition-all cursor-pointer appearance-none text-center"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-asphalt text-paper">{cat}</option>
                    ))}
                  </select>
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
                      onClick={() => toggleBestSeller(product.id, !!product.isBestSeller)}
                      disabled={pendingProductIds.includes(product.id)}
                      title={product.isBestSeller ? "Bỏ khỏi mục bán chạy" : "Đưa vào mục bán chạy"}
                      className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 group/btn disabled:opacity-50 ${
                        product.isBestSeller 
                        ? "bg-yellow-500 text-asphalt border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                        : "bg-paper/5 text-paper/40 border-paper/5 hover:text-paper hover:bg-paper/10"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${product.isBestSeller ? "fill-asphalt" : ""}`} />
                      {product.isBestSeller && <span className="text-[9px] font-bold uppercase tracking-widest">Bán chạy</span>}
                    </button>
                    <Link 
                      href={`/admin/products/${product.id}`}
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-paper text-paper/40 hover:text-asphalt transition-all border border-paper/5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteSingle(product.id, product.name)}
                      className="p-2.5 rounded-xl bg-paper/5 hover:bg-red-500/10 text-paper/40 hover:text-red-500 transition-all border border-paper/5"
                    >
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

      {/* CUSTOM MODALS */}
      <AnimatePresence>
        {importPreview.length > 0 && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setImportPreview([])} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-paper/10 bg-[#1a1917] shadow-2xl"
            >
              <div className="flex flex-col gap-4 border-b border-paper/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FF8C00]">Xem trước import</p>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-paper">
                    {importPreview.length} sản phẩm sẵn sàng nhập
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/50">
                    Kiểm tra nhanh tên, danh mục, giá và số mục nội dung trước khi tạo hoặc cập nhật hàng loạt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportPreview([])}
                  className="self-start rounded-full p-2 text-paper/30 transition hover:bg-paper/5 hover:text-paper"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[55vh] overflow-auto">
                <table className="w-full min-w-[780px] text-left">
                  <thead className="sticky top-0 bg-[#1a1917]">
                    <tr className="border-b border-paper/10">
                      <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-paper/30">Sản phẩm</th>
                      <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-paper/30">Danh mục</th>
                      <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-paper/30">Giá</th>
                      <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-paper/30">Nội dung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper/5">
                    {importPreview.slice(0, 50).map((product, index) => (
                      <tr key={`${product.slug}-${index}`}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold uppercase text-paper">{product.name}</p>
                          <p className="mt-1 text-[9px] font-mono text-paper/25">{product.slug}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-paper/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-paper/60">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#FF8C00]">
                          {formatPrice(Number(product.price) || 0)}₫
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-paper/40">
                          {product.features.length} tính năng · {product.instructions.length} bước · {product.plans.length} gói
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 50 && (
                  <p className="border-t border-paper/5 px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-paper/30">
                    Đang hiển thị 50 sản phẩm đầu tiên
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-paper/10 p-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setImportPreview([])}
                  className="rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-paper/40 transition hover:bg-paper/5 hover:text-paper"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmImportProducts}
                  disabled={isImporting}
                  className="rounded-xl bg-paper px-6 py-3 text-[10px] font-bold uppercase tracking-widest !text-asphalt transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {isImporting ? "Đang nhập..." : "Xác nhận nhập"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1a1917] border border-paper/10 p-8 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md"
            >
              <h3 className="text-xl font-bold uppercase tracking-tight text-paper mb-2">{confirmModal.title}</h3>
              <p className="text-paper/60 text-sm font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-paper/40 hover:bg-paper/5 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toasts.length > 0 && (
          <div className="fixed top-6 right-6 z-[999] flex w-full max-w-sm flex-col gap-3">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                className={`rounded-[1.75rem] border p-5 shadow-[0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${
                  toast.type === "success"
                    ? "bg-[#1a1917]/95 border-emerald-500/20"
                    : "bg-[#1a1917]/95 border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      toast.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-paper">{toast.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-paper/60">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                    className="rounded-full p-1 text-paper/30 transition hover:bg-paper/5 hover:text-paper"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
