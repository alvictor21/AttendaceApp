"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  nama_user: string;
  username: string;
  role: string;
  nik: string;
  jabatan: string | null;
  email?: string | null;
  no_hp?: string | null;
};

function getInitials(nama?: string | null): string {
  if (!nama) return "?";
  const kata = nama.trim().split(/\s+/);
  const inisial = kata.slice(0, 2).map((k) => k.charAt(0).toUpperCase());
  return inisial.join("") || "?";
}

function AdminProfileCard() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user"); // sesuaikan key kalau di login handler kamu beda
      if (raw) setAdmin(JSON.parse(raw));
    } catch {
      setAdmin(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) return null;

  if (!admin) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-400">Data admin tidak ditemukan. Silakan login ulang.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-rose-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {getInitials(admin.nama_user)}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-gray-900 truncate">{admin.nama_user}</p>
          <p className="text-sm text-gray-500 truncate">{admin.jabatan ?? "-"}</p>
        </div>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <Baris label="Email" value={admin.email} />
        <Baris label="Nomor HP" value={admin.no_hp} />
        <Baris label="NIK" value={admin.nik} />
      </div>
    </div>
  );
}

function Baris({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium">{value ?? "-"}</span>
    </div>
  );
}

export default AdminProfileCard;