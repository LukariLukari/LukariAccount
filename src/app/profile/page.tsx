import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Package, Clock, CheckCircle, AlertCircle, CreditCard, ExternalLink, ShoppingCart, LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import {
  ensureWallet,
  getTopUpRequests,
  getWalletTransactions,
  WalletUserNotFoundError,
} from "@/lib/wallet";
import WalletPanel from "@/components/WalletPanel";
import SessionRecovery from "@/components/SessionRecovery";

export const metadata = {
  title: "Thông tin cá nhân | LukariAccount",
  description: "Quản lý thông tin tài khoản và lịch sử đơn hàng của bạn.",
};

const statusMap: Record<string, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/20" },
  PAID: { label: "Đã thanh toán", icon: CreditCard, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  FULFILLED: { label: "Hoàn thành", icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/20" },
  CANCELLED: { label: "Đã hủy", icon: AlertCircle, color: "text-red-400", bgColor: "bg-red-500/20" },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  let wallet;
  try {
    wallet = await ensureWallet(session.user.id);
  } catch (error) {
    if (error instanceof WalletUserNotFoundError) {
      return (
        <SessionRecovery
          callbackUrl="/auth/login?callbackUrl=/profile"
          message="Phiên đăng nhập của bạn đã cũ hoặc tài khoản không còn khả dụng. Mình đang đưa bạn về trang đăng nhập."
        />
      );
    }
    throw error;
  }

  const [user, orders, walletTransactions, topUpRequests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    getWalletTransactions(session.user.id, 20),
    getTopUpRequests(session.user.id, 10),
  ]);

  if (!user) {
    return (
      <SessionRecovery
        callbackUrl="/auth/login?callbackUrl=/profile"
        message="Không tìm thấy dữ liệu tài khoản hiện tại. Mình đang đưa bạn về trang đăng nhập."
      />
    );
  }

  return (
    <div className="min-h-screen bg-asphalt text-paper font-montserrat pt-24 md:pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">
          Tài khoản của bạn
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* User Information */}
          <div className="bg-paper/5 border border-paper/10 rounded-[2.5rem] p-8 shadow-2xl lg:sticky lg:top-32">
            <div className="flex flex-col items-center text-center">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-paper/10 mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-paper/10 border-4 border-paper/10 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-paper/40" />
                </div>
              )}
              
              <h2 className="text-xl font-black uppercase tracking-tight">{user.name || "Khách hàng"}</h2>
              <p className="text-[11px] font-bold text-paper/40 tracking-widest mt-1 mb-6">{user.email}</p>
              
              <div className="w-full flex justify-between border-t border-b border-paper/10 py-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#FF8C00]">{orders.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-paper/40 mt-1">Đơn hàng</p>
                </div>
                <div className="w-[1px] bg-paper/10" />
                <div className="text-center">
                  <p className="text-2xl font-black text-paper">{new Date(user.createdAt).getFullYear()}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-paper/40 mt-1">Tham gia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2 space-y-6">
            <WalletPanel
              initialData={{
                wallet,
                transactions: walletTransactions,
                topUpRequests,
              }}
            />

            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6">Lịch sử đơn hàng</h2>

            {orders.length === 0 ? (
              <div className="bg-paper/5 border border-paper/10 rounded-[2.5rem] p-12 text-center shadow-2xl">
                <Package className="w-16 h-16 text-paper/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-[11px] font-medium text-paper/40 tracking-widest uppercase mb-8">
                  Hãy khám phá các sản phẩm và dịch vụ của chúng tôi!
                </p>
                <Link 
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF8C00] text-asphalt font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusMap[order.status] || statusMap.PENDING;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={order.id} className="bg-paper/5 border border-paper/10 rounded-[2rem] p-6 md:p-8 hover:bg-paper/10 transition-colors shadow-xl">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-paper/5">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-black tracking-tight text-paper uppercase">
                              {order.orderCode}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${status.bgColor} ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-paper/40 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xl font-black text-[#FF8C00]">
                            {formatPrice(order.total)}₫
                          </p>
                          {order.discountAmount > 0 && (
                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-1">
                              Tiết kiệm {formatPrice(order.discountAmount)}₫
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center group">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-bold text-paper/90 truncate group-hover:text-paper transition-colors">
                                {item.productName}
                              </p>
                              {item.productSlug && (
                                <Link href={`/products/${item.productSlug}`} className="text-[9px] font-medium text-paper/30 hover:text-[#FF8C00] tracking-widest uppercase transition-colors inline-flex items-center gap-1 mt-0.5">
                                  Xem sản phẩm <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-paper/80">
                                <span className="text-paper/40 font-medium text-xs mr-1">x{item.quantity}</span>
                                {formatPrice(item.unitPrice)}₫
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
