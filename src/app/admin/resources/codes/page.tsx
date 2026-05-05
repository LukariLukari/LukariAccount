"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, TicketPercent, Calendar, Users, Hash } from "lucide-react";

interface ResourceCode {
  id: string;
  code: string;
  resourceId: string;
  maxUses: number;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
  resource: {
    title: string;
  };
}

interface Resource {
  id: string;
  title: string;
}

export default function AdminResourceCodesPage() {
  const [codes, setCodes] = useState<ResourceCode[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newCode, setNewCode] = useState({
    code: "",
    resourceId: "",
    maxUses: 1,
    expiresAt: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [codesRes, resourcesRes] = await Promise.all([
        fetch("/api/admin/resource-codes"),
        fetch("/api/admin/resources"),
      ]);
      const codesData = await codesRes.json();
      const resourcesData = await resourcesRes.json();
      setCodes(Array.isArray(codesData) ? codesData : []);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
    } catch (error) {
      setMessage({ type: "error", text: "Không thể tải dữ liệu." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/resource-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCode),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo mã.");
      }

      setMessage({ type: "success", text: "Đã tạo mã thành công." });
      setNewCode({ code: "", resourceId: "", maxUses: 1, expiresAt: "" });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã này?")) return;

    try {
      const res = await fetch(`/api/admin/resource-codes?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Không thể xóa mã.");

      setMessage({ type: "success", text: "Đã xóa mã thành công." });
      fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi xóa mã." });
    }
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const inputClass = "w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-[11px] font-bold text-paper outline-none focus:border-paper/30 transition-all placeholder:text-paper/20";
  const labelClass = "text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-2 block";

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-[1.8rem] lg:text-[2rem] leading-[0.95] font-bold tracking-tight mb-2 uppercase">
          Mã tài nguyên
        </h1>
        <p className="text-paper/40 text-[9px] font-bold uppercase tracking-[0.16em]">
          Tạo mã để người dùng có thể mở khóa tài nguyên mà không cần thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-6">
        {/* Create Form */}
        <div className="rounded-[1.25rem] border border-paper/10 bg-paper/[0.04] p-6 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-tight text-paper mb-6">Tạo mã mới</h2>
          <form onSubmit={handleCreateCode} className="space-y-4">
            <div>
              <label className={labelClass}>Mã code</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  placeholder="VD: RESOURCE2024"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="ui-btn ui-btn-secondary px-3 py-2 rounded-xl text-[8px]"
                >
                  <Hash className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Chọn tài nguyên</label>
              <select
                className={inputClass}
                value={newCode.resourceId}
                onChange={(e) => setNewCode({ ...newCode, resourceId: e.target.value })}
                required
              >
                <option value="">-- Chọn tài nguyên --</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id} className="bg-asphalt text-paper">
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Số lần dùng tối đa</label>
                <input
                  type="number"
                  className={inputClass}
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Hết hạn (không bắt buộc)</label>
                <input
                  type="date"
                  className={inputClass}
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-[10px] font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ui-btn ui-btn-primary w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo mã ngay"}
            </button>
          </form>
        </div>

        {/* Codes List */}
        <div className="rounded-[1.25rem] border border-paper/10 bg-paper/[0.04] p-6 overflow-hidden">
          <h2 className="text-sm font-bold uppercase tracking-tight text-paper mb-6">Danh sách mã đã tạo</h2>
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-paper/5 rounded-2xl" />
              ))}
            </div>
          ) : codes.length === 0 ? (
            <div className="py-20 text-center text-paper/20 uppercase font-bold text-[10px] tracking-widest">
              Chưa có mã nào được tạo
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {codes.map((code) => (
                <div key={code.id} className="group bg-paper/5 border border-paper/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-paper/10 transition-all">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-paper font-mono tracking-wider">{code.code}</span>
                      <span className="ui-chip px-2 py-0.5 text-[8px]">{code?.resource?.title || 'N/A'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-paper/30 text-[9px] font-bold uppercase tracking-widest">
                        <Users className="w-3 h-3" />
                        <span>Sử dụng: {code.usageCount} / {code.maxUses}</span>
                      </div>
                      {code.expiresAt && (
                        <div className="flex items-center gap-1.5 text-paper/30 text-[9px] font-bold uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          <span>Hết hạn: {new Date(code.expiresAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    className="p-2.5 rounded-lg text-paper/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
