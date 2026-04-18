import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500 mt-1">Discover our collection of premium software.</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Video', 'Design', 'Developer', 'Marketing', 'Analytics'].map((tag, i) => (
                <button 
                  key={tag}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap border ${
                    i === 0 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-600 border-border hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      
      <footer className="mt-auto border-t border-border bg-slate-50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center font-bold mb-4 rounded-sm">S</div>
            <p className="text-slate-500 max-w-sm">
              StandardSaaS provides high-quality software solutions for businesses of all sizes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Store</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-primary">All Products</a></li>
              <li><a href="#" className="hover:text-primary">Categories</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary">FAQs</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 StandardSaaS. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
