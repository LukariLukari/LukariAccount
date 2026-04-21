"use client";

import { useState } from "react";
import { X, Copy, Check, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/data";
import { useEffect } from "react";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  plan: { label: string; price: number; cycle: string };
  quantity: number;
}

interface BankInfo {
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  qrCodeUrl: string;
}

export default function PaymentPopup({ isOpen, onClose, product, plan, quantity }: PaymentPopupProps) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const totalPrice = plan.price * quantity;

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

  const transferContent = `LUKARI ${product.name} ${plan.cycle} x${quantity}${note ? " - " + note : ""}`;

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
            </div>

            {/* QR Code & Bank Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* QR Code */}
              <div className="bg-paper/5 rounded-2xl p-5 border border-paper/10 flex flex-col items-center">
                <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-3">
                  Quét mã QR
                </p>
                {bankInfo?.qrCodeUrl ? (
                  <img
                    src={bankInfo.qrCodeUrl}
                    alt="QR Code thanh toán"
                    className="w-40 h-40 rounded-xl bg-white p-2 object-contain"
                  />
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

            {/* Footer note */}
            <div className="text-center">
              <p className="text-paper/20 text-[9px] font-bold uppercase tracking-widest">
                Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong vòng 5-15 phút
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
