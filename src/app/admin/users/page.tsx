"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Shield, 
  User as UserIcon,
  Clock,
  Mail
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Quản lý người dùng</h1>
        <p className="text-paper/40 text-[11px] font-bold uppercase tracking-widest">
          {users.length} tài khoản đã đăng ký trên hệ thống
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-paper/5 backdrop-blur-3xl p-4 rounded-3xl border border-paper/10">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-asphalt/50 border border-paper/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-paper/5 backdrop-blur-3xl rounded-[3rem] border border-paper/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-paper/10 bg-paper/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Người dùng</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Vai trò</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30">Ngày tham gia</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/30 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper/5">
            {isLoading ? (
              [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-8 py-10 bg-paper/5" /></tr>)
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-paper/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-paper/10 flex items-center justify-center text-paper/20 group-hover:text-paper/60 transition-colors">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">{user.name || "N/A"}</p>
                      <div className="flex items-center gap-2 text-[10px] text-paper/40">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    user.role === "ADMIN" ? "bg-[#FF8C00]/20 text-[#FF8C00]" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {user.role === "ADMIN" ? <Shield className="w-3 h-3" /> : null}
                    {user.role}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-[11px] text-paper/60">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="text-[10px] font-bold uppercase tracking-widest text-paper/20 hover:text-paper transition-all">
                     Chi tiết
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
