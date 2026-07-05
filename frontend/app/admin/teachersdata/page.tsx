"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Guru {
  id: number;
  nik: string;
  nama_lengkap: string;
  jabatan: string;
}

interface ApiResponse {
  total: number;
  guru: Guru[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-200", "bg-amber-200", "bg-purple-200", "bg-sky-200", "bg-green-200",
  "bg-orange-200", "bg-teal-200", "bg-pink-200", "bg-indigo-200", "bg-lime-200",
];

function avatarColor(nik: string): string {
  let hash = 0;
  for (const ch of nik) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-sm font-semibold text-slate-700">{initials}</span>
    </div>
  );
}

function GuruCard({
  guru,
  onEdit,
  onDelete,
}: {
  guru: Guru;
  onEdit: (guru: Guru) => void;
  onDelete: (guru: Guru) => void;
}) {
  const initials = getInitials(guru.nama_lengkap);
  const color = avatarColor(guru.nik);

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-slate-100">
      <Avatar initials={initials} color={color} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {guru.nama_lengkap}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">NIK- {guru.nik}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500">{guru.jabatan}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onEdit(guru)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          aria-label="Edit data guru"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(guru)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Hapus data guru"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TeacherDataPage() {
    const router = useRouter();
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/admin/guru`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      setGuruList(data.guru);
    } catch (err) {
      setError("Gagal memuat data. Periksa koneksi ke server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (guru: Guru) => {
    const confirmDelete = window.confirm(
      `Hapus data ${guru.nama_lengkap}? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/admin/guru/${guru.nik}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setGuruList((prev) => prev.filter((g) => g.nik !== guru.nik));
      setNotice(`${guru.nama_lengkap} berhasil dihapus.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error(err);
      window.alert("Gagal menghapus data guru.");
    }
  };

  

  // Placeholder — form edit menyusul
  const handleEdit = (guru: Guru) => {
    router.push(`/admin/teachersdata/${guru.nik}`);
  };

    const handleAdd = () => {
    router.push("/admin/teachersdata/new");
    };

  const filtered = guruList.filter(
    (g) =>
      g.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      g.nik.includes(search)
  );

  return (
    <div className="bg-slate-50 flex justify-center">
      <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">Detail Data Guru</h1>
          <p className="text-xs text-slate-400 mt-0.5">Kelola data diri seluruh guru</p>

          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3.5 py-2.5 mt-3">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau NIK…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 mt-3 bg-red-500 text-white text-sm font-semibold rounded-2xl py-2.5 hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
            Add New Data Guru
          </button>
        </div>

        {notice && (
          <div className="bg-slate-800 text-white text-xs text-center py-2 px-4">
            {notice}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Data Guru</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {loading ? "Memuat data…" : `Menampilkan ${filtered.length} guru terdaftar`}
              </p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl px-4 py-3.5 h-[76px] animate-pulse border border-slate-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={() => { setLoading(true); fetchData(); }} className="mt-3 text-xs text-slate-500 underline">
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-3">
              {filtered.length > 0 ? (
                filtered.map((guru) => (
                  <GuruCard key={guru.nik} guru={guru} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm">Tidak ada guru ditemukan.</p>
                  <p className="text-xs mt-1">Coba kata kunci lain.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}