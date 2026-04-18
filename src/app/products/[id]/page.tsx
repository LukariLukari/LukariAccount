import Navbar from "@/components/Navbar";
import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import { Star, CheckCircle2, Shield } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = products.find(p => p.id === resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="text-sm text-slate-500 mb-8 flex items-center gap-2">
            <a href="/" className="hover:text-primary">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-primary">Products</a>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </div>

          <div className="bg-secondary border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left: Image Gallery */}
              <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center items-center bg-transparent">
                <div className="aspect-[4/3] w-full bg-background rounded-lg border border-border flex items-center justify-center text-slate-400 mb-4 shadow-sm overflow-hidden p-8">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>No Image Available</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 w-full">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-slate-200 border border-border rounded cursor-pointer hover:border-primary transition-colors flex items-center justify-center text-xs text-slate-400">
                      Img {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-8 lg:p-12">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded mb-4">
                  {product.category}
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {product.rating}
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="text-sm text-slate-600">
                    {product.downloads} verified purchases
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-6">
                  {product.originalPrice && (
                    <div className="text-lg text-slate-400 line-through">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  )}
                  <div className="text-4xl font-bold text-slate-900">
                    {product.price.toLocaleString('vi-VN')}₫
                    <span className="text-xl text-slate-500 font-normal ml-2">/ {product.billingCycle}</span>
                  </div>
                </div>

                <p className="text-slate-600 mb-8 leading-relaxed">
                  {product.description}
                  <br /><br />
                  This is a comprehensive software solution designed to meet standard enterprise requirements. It includes lifetime updates, standard support, and all necessary features for your business.
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-cta" /> One-time payment, lifetime access
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-cta" /> Free updates for 12 months
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-cta" /> Standard email support
                  </div>
                </div>

                <AddToCartButton product={product} />

                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded border border-border">
                  <Shield className="w-4 h-4 text-green-600" />
                  Secure checkout processed by standard payment gateways.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
