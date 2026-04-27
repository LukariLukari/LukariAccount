"use client";

import { useState } from "react";
import { X, Copy, Check, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/data";
import { useEffect } from "react";
import Image from "next/image";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  plan: { label: string; price: number; cycle: string };
  quantity: number;
  lineItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  onSubmitOrder?: (note: string) => Promise<{ orderCode?: string } | void>;
}

interface BankInfo {
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  qrCodeUrl: string;
  zaloLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  paymentGuideText?: string;
  transferContentTemplate?: string;
  orderMessageTemplate?: string;
  paymentFooterText?: string;
}

const DEFAULT_PAYMENT_GUIDE =
  "Bấm nút bên dưới để copy sẵn nội dung đơn, sau đó gửi qua Zalo hoặc Instagram cho shop xử lý nhanh hơn.";
const DEFAULT_TRANSFER_TEMPLATE = "LUKARI {product} {cycle} x{quantity}{noteSuffix}";
const DEFAULT_ORDER_TEMPLATE = `Chào shop, mình đã đặt đơn:
Sản phẩm: {product}
Gói: {plan} / {cycle}
Số lượng: {quantity}
Tổng tiền: {total}đ
Chi tiết: {itemLines}
Nội dung chuyển khoản: {transferContent}
{noteLine}`;
const DEFAULT_PAYMENT_FOOTER = "Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong vòng 5-15 phút";

function renderTemplate(template: string | undefined, fallback: string, values: Record<string, string>) {
  const source = template?.trim() ? template : fallback;
  return source.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export default function PaymentPopup({ isOpen, onClose, product, plan, quantity, lineItems, onSubmitOrder }: PaymentPopupProps) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submittedOrderCode, setSubmittedOrderCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const totalPrice = plan.price * quantity;
  const itemLines = lineItems?.length
    ? lineItems
        .map((item) => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}đ`)
        .join("; ")
    : `${product.name} x${quantity}`;

  useEffect(() => {
    if (isOpen) {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => setBankInfo(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleCopyAccount = () => {
    if (bankInfo?.bankAccount) {
      navigator.clipboard.writeText(bankInfo.bankAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const baseValues = {
    product: product.name,
    slug: product.slug,
    category: product.category,
    plan: plan.label,
    cycle: plan.cycle,
    quantity: String(quantity),
    total: formatPrice(totalPrice),
    itemLines,
    note,
    noteSuffix: note ? ` - ${note}` : "",
    noteLine: note ? `Ghi chú: ${note}` : "",
  };
  const transferContent = renderTemplate(
    bankInfo?.transferContentTemplate,
    DEFAULT_TRANSFER_TEMPLATE,
    baseValues
  );
  const orderMessage = renderTemplate(
    bankInfo?.orderMessageTemplate,
    DEFAULT_ORDER_TEMPLATE,
    { ...baseValues, transferContent }
  ).replace(/\n{3,}/g, "\n\n").trim();
  const paymentGuideText = bankInfo?.paymentGuideText?.trim() || DEFAULT_PAYMENT_GUIDE;
  const paymentFooterText = bankInfo?.paymentFooterText?.trim() || DEFAULT_PAYMENT_FOOTER;
  const instagramUrl = bankInfo?.instagramLink || bankInfo?.facebookLink;

  const handleCopyOrder = async () => {
    await navigator.clipboard.writeText(orderMessage);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const openContact = async (url?: string) => {
    if (!url) return;
    await handleCopyOrder();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitOrder = async () => {
    if (!onSubmitOrder || submittedOrderCode) return;
    setIsSubmittingOrder(true);
    setSubmitError("");
    try {
      const result = await onSubmitOrder(note);
      setSubmittedOrderCode(result?.orderCode || plan.label);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể xác nhận đơn hàng");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-[#1a1917] border border-paper/10 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-paper/10 text-paper/40 hover:text-paper transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-montserrat font-bold text-paper uppercase tracking-tight mb-2">
                Thanh toán
              </h2>
              <div className="h-1 w-10 bg-[#FF8C00] rounded-full" />
            </div>

            {/* Order Summary */}
            <div className="bg-paper/5 rounded-2xl p-5 border border-paper/10 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-montserrat font-bold text-sm text-paper uppercase">{product.name}</h3>
                  <p className="text-paper/30 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Gói {plan.label} • SL: {quantity}
                  </p>
                </div>
                <span className="text-[#FF8C00] font-montserrat font-bold text-lg">
                  {formatPrice(totalPrice)}₫
                </span>
              </div>
              {lineItems?.length ? (
                <div className="mt-4 space-y-2 border-t border-paper/10 pt-4">
                  {lineItems.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-[11px] font-bold text-paper/50">
                      <span className="line-clamp-1">{item.name} x{item.quantity}</span>
                      <span className="shrink-0">{formatPrice(item.price * item.quantity)}₫</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* QR Code & Bank Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* QR Code */}
              <div className="bg-paper/5 rounded-2xl p-5 border border-paper/10 flex flex-col items-center">
                <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-3">
                  Quét mã QR
                </p>
                {bankInfo?.qrCodeUrl ? (
                  <div className="relative w-40 h-40 rounded-xl bg-white p-2 overflow-hidden">
                    <Image
                      src={bankInfo.qrCodeUrl}
                      alt="QR Code thanh toán"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-paper/10 flex items-center justify-center text-paper/20 text-[10px] font-bold">
                    QR CODE
                  </div>
                )}
              </div>

              {/* Bank Info */}
              <div className="bg-paper/5 rounded-2xl p-5 border border-paper/10 flex flex-col gap-4">
                <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30">
                  Thông tin chuyển khoản
                </p>
                <div>
                  <p className="text-[9px] font-bold text-paper/30 uppercase tracking-widest mb-1">Ngân hàng</p>
                  <p className="text-paper font-bold text-sm">{bankInfo?.bankName || "..."}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-paper/30 uppercase tracking-widest mb-1">Số tài khoản</p>
                  <div className="flex items-center gap-2">
                    <p className="text-paper font-bold text-sm font-mono">{bankInfo?.bankAccount || "..."}</p>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1.5 rounded-lg hover:bg-paper/10 transition-all text-paper/30 hover:text-paper"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-paper/30 uppercase tracking-widest mb-1">Chủ tài khoản</p>
                  <p className="text-paper font-bold text-sm">{bankInfo?.bankOwner || "..."}</p>
                </div>
              </div>
            </div>

            {/* Transfer Content */}
            <div className="bg-[#FF8C00]/10 rounded-2xl p-4 border border-[#FF8C00]/20 mb-6">
              <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#FF8C00] mb-2">
                Nội dung chuyển khoản
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-paper font-bold text-xs font-mono break-all">{transferContent}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transferContent);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#FF8C00]/20 transition-all text-[#FF8C00]/60 hover:text-[#FF8C00] shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>

            {/* Note Input */}
            <div className="mb-6">
              <label className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-2 block">
                <MessageSquare className="w-3 h-3 inline mr-1.5" />
                Ghi chú cho đơn hàng
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập email nhận tài khoản, ghi chú..."
                className="w-full bg-paper/5 border border-paper/10 rounded-xl p-4 text-paper text-xs font-bold outline-none focus:border-paper/30 transition-all resize-none h-20 placeholder:text-paper/20"
              />
            </div>

            {/* Contact Confirmation */}
            <div className="bg-paper/5 rounded-2xl p-4 border border-paper/10 mb-6">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-2">
                    Gửi xác nhận đơn hàng
                  </p>
                  <p className="text-paper/45 text-[11px] leading-relaxed font-bold">
                    {paymentGuideText}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openContact(bankInfo?.zaloLink)}
                    disabled={!bankInfo?.zaloLink}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0068ff]/15 border border-[#0068ff]/25 px-4 py-3 text-[10px] font-montserrat font-bold uppercase tracking-widest text-blue-200 transition-all hover:bg-[#0068ff]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nhắn Zalo
                  </button>
                  <button
                    type="button"
                    onClick={() => openContact(instagramUrl)}
                    disabled={!instagramUrl}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/25 px-4 py-3 text-[10px] font-montserrat font-bold uppercase tracking-widest text-[#FFB45C] transition-all hover:bg-[#FF8C00]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nhắn Instagram
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="flex items-center justify-center gap-2 rounded-xl bg-paper/5 border border-paper/10 px-4 py-3 text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/55 transition-all hover:bg-paper/10 hover:text-paper"
                >
                  {copiedOrder ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedOrder ? "Đã copy nội dung đơn" : "Copy nội dung đơn"}
                </button>

                {onSubmitOrder && (
                  <div className="space-y-3 rounded-2xl border border-paper/10 bg-asphalt/30 p-4">
                    {submittedOrderCode ? (
                      <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center">
                        <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-green-300 mb-1">
                          Đã ghi nhận đơn hàng
                        </p>
                        <p className="text-lg font-montserrat font-bold text-paper">{submittedOrderCode}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-paper/80 text-[11px] leading-relaxed font-bold">
                          Chỉ bấm xác nhận sau khi bạn đã chuyển khoản hoặc đã gửi thông tin đơn cho shop.
                        </p>
                        <button
                          type="button"
                          onClick={handleSubmitOrder}
                          disabled={isSubmittingOrder}
                          className="w-full rounded-xl !bg-[#efede3] !text-[#302f2c] px-4 py-3 text-[10px] font-montserrat font-bold uppercase tracking-widest transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                        >
                          {isSubmittingOrder ? "Đang ghi nhận..." : "Xác nhận đã gửi đơn"}
                        </button>
                      </>
                    )}
                    {submitError && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">
                        {submitError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center">
              <p className="text-paper/80 text-[9px] font-bold uppercase tracking-widest">
                {paymentFooterText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
