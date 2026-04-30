import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-slate-50 border-b border-border py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
            The software you need to <span className="text-primary">scale your business</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-xl">
            A curated marketplace of premium SaaS applications. 
            Automated billing, instant delivery, and verified quality.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Link 
              href="/products" 
              className="px-6 py-3 bg-cta hover:bg-cta/90 text-white rounded-md font-medium transition-all shadow-glow flex items-center justify-center gap-2"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-md font-medium transition-colors border border-border flex items-center justify-center"
            >
              View Pricing
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cta" /> Instant Access
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cta" /> Secure Checkout
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="aspect-video bg-slate-200 rounded-lg border border-slate-300 flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100" />
            <div className="text-slate-400 font-medium relative z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🛒</span>
              Product Preview
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
