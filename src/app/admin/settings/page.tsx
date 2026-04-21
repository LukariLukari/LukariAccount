"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, ExternalLink } from "lucide-react";

interface ResourceLink {
  title: string;
  url: string;
  platform: string;
  description: string;
}

interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  zaloLink: string;
  facebookLink: string;
  tiktokLink: string;
  telegramLink: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  qrCodeUrl: string;
  resourceLinks: ResourceLink[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    phone: "",
    email: "",
    address: "",
    zaloLink: "",
    facebookLink: "",
    tiktokLink: "",
    telegramLink: "",
    bankName: "",
    bankAccount: "",
    bankOwner: "",
    qrCodeUrl: "",
    resourceLinks: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings({
          ...data,
          resourceLinks: data.resourceLinks || [],
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Đã lưu thành công!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Lỗi khi lưu!");
      }
    } catch (error) {
      setMessage("Lỗi khi lưu!");
    } finally {
      setIsSaving(false);
    }
  };

  const addResourceLink = () => {
    setSettings((prev) => ({
      ...prev,
      resourceLinks: [
        ...prev.resourceLinks,
        { title: "", url: "", platform: "tiktok", description: "" },
      ],
    }));
  };

  const removeResourceLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.filter((_: ResourceLink, i: number) => i !== index),
    }));
  };

  const updateResourceLink = (index: number, field: keyof ResourceLink, value: string) => {
    setSettings((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((link: ResourceLink, i: number) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const inputClass =
    "w-full bg-asphalt/50 border border-paper/10 rounded-xl py-3 px-4 text-sm font-bold text-paper outline-none focus:border-paper/30 transition-all placeholder:text-paper/20";
  const labelClass =
    "text-[9px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/30 mb-2 block";

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">
            Cài đặt
          </h1>
          <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
            Quản lý thông tin footer, thanh toán, và tài nguyên
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-paper text-asphalt rounded-2xl font-montserrat font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold ${
            message.includes("thành công")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message}
        </div>
      )}

      {/* Contact Info Section */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] border border-paper/10 p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-paper/10 pb-4">
          📞 Thông tin liên hệ (Footer)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Số điện thoại</label>
            <input
              className={inputClass}
              value={settings.phone}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="0912 345 678"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={settings.email}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="lukari@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Địa chỉ</label>
            <input
              className={inputClass}
              value={settings.address}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Hà Nội, Việt Nam"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] border border-paper/10 p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-paper/10 pb-4">
          🌐 Mạng xã hội
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input
              className={inputClass}
              value={settings.facebookLink}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  facebookLink: e.target.value,
                }))
              }
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>TikTok URL</label>
            <input
              className={inputClass}
              value={settings.tiktokLink}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  tiktokLink: e.target.value,
                }))
              }
              placeholder="https://tiktok.com/@..."
            />
          </div>
          <div>
            <label className={labelClass}>Zalo URL</label>
            <input
              className={inputClass}
              value={settings.zaloLink}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, zaloLink: e.target.value }))
              }
              placeholder="https://zalo.me/..."
            />
          </div>
          <div>
            <label className={labelClass}>Telegram URL</label>
            <input
              className={inputClass}
              value={settings.telegramLink}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  telegramLink: e.target.value,
                }))
              }
              placeholder="https://t.me/..."
            />
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] border border-paper/10 p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-paper/10 pb-4">
          🏦 Thông tin thanh toán
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Tên ngân hàng</label>
            <input
              className={inputClass}
              value={settings.bankName}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bankName: e.target.value }))
              }
              placeholder="Vietcombank"
            />
          </div>
          <div>
            <label className={labelClass}>Số tài khoản</label>
            <input
              className={inputClass}
              value={settings.bankAccount}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankAccount: e.target.value,
                }))
              }
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className={labelClass}>Chủ tài khoản</label>
            <input
              className={inputClass}
              value={settings.bankOwner}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bankOwner: e.target.value }))
              }
              placeholder="NGUYEN VAN A"
            />
          </div>
          <div>
            <label className={labelClass}>Link ảnh QR Code</label>
            <input
              className={inputClass}
              value={settings.qrCodeUrl}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, qrCodeUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Resource Links */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[2rem] border border-paper/10 p-8">
        <div className="flex justify-between items-center mb-6 border-b border-paper/10 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            📚 Tài nguyên miễn phí
          </h2>
          <button
            onClick={addResourceLink}
            className="flex items-center gap-2 px-4 py-2 bg-paper/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-paper/20 transition-all"
          >
            <Plus className="w-3 h-3" />
            Thêm link
          </button>
        </div>

        <div className="space-y-6">
          {settings.resourceLinks.map((link: ResourceLink, index: number) => (
            <div
              key={index}
              className="bg-asphalt/30 rounded-2xl p-5 border border-paper/5 relative"
            >
              <button
                onClick={() => removeResourceLink(index)}
                className="absolute top-3 right-3 p-2 rounded-xl hover:bg-red-500/10 text-paper/20 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tiêu đề</label>
                  <input
                    className={inputClass}
                    value={link.title}
                    onChange={(e) =>
                      updateResourceLink(index, "title", e.target.value)
                    }
                    placeholder="Hướng dẫn sử dụng ChatGPT"
                  />
                </div>
                <div>
                  <label className={labelClass}>URL</label>
                  <input
                    className={inputClass}
                    value={link.url}
                    onChange={(e) =>
                      updateResourceLink(index, "url", e.target.value)
                    }
                    placeholder="https://tiktok.com/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Nền tảng</label>
                  <select
                    className={inputClass}
                    value={link.platform}
                    onChange={(e) =>
                      updateResourceLink(index, "platform", e.target.value)
                    }
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mô tả ngắn</label>
                  <input
                    className={inputClass}
                    value={link.description}
                    onChange={(e) =>
                      updateResourceLink(index, "description", e.target.value)
                    }
                    placeholder="Video hướng dẫn chi tiết..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
