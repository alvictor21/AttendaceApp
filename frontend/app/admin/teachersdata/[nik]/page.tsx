"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, Phone, MapPin, Pencil, Save,
  CheckCircle2, Clock, CalendarOff, Thermometer, XCircle, ChevronRight,
} from "lucide-react";
import { API } from "@/src/meta/api";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface GuruDetail {
  id: number;
  nik: string;
  nama_lengkap: string;
  tgl_lahir: string | null;
  jabatan: string;
  no_hp: string | null;
  alamat: string | null;
  email: string | null;
}
interface AkunInfo { username: string; role: string; }
interface DetailResponse { guru: GuruDetail; akun: AkunInfo; }
interface StatistikSummary { on_time: number; late: number; izin: number; sakit: number; alpha: number; }
interface StatistikResponse { bulan: number; tahun: number; summary: StatistikSummary; }

const BULAN_NAMA = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface FormState {
  nama_lengkap: string; jabatan: string; no_hp: string;
  alamat: string; email: string; username: string; password: string;
}

function InfoRow({
  icon, value, editing, onChange, placeholder,
}: { icon: React.ReactNode; value: string; editing: boolean; onChange: (v: string) => void; placeholder?: string; }) {
  return (
    <div className="flex items-center gap-2.5 mt-2">
      <span className="text-red-400 shrink-0">{icon}</span>
      {editing ? (
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-slate-100 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200"
        />
      ) : (
        <span className="text-sm text-slate-600">{value || "-"}</span>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color, bg }: { icon: React.ReactNode; value: number; label: string; color: string; bg: string; }) {
  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col gap-2 shadow-sm border border-slate-100">
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function TeacherDetailPage() {
  const router = useRouter();
  const params = useParams<{ nik: string }>();
  const nik = params.nik;

  const [guru, setGuru] = useState<GuruDetail | null>(null);
  const [akun, setAkun] = useState<AkunInfo | null>(null);
  const [statistik, setStatistik] = useState<StatistikSummary | null>(null);
  const [periode, setPeriode] = useState<{ bulan: number; tahun: number } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [detailRes, statRes] = await Promise.all([
        fetch(`/api/teachers/${nik}`, {
          cache: "no-store",
        }),
        fetch(`/api/teachers/${nik}/statistik-bulanan`, {
          cache: "no-store",
        }),
      ]);

      if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`);
      const detail: DetailResponse = await detailRes.json();
      setGuru(detail.guru);
      setAkun(detail.akun);
      setForm({
        nama_lengkap: detail.guru.nama_lengkap,
        jabatan: detail.guru.jabatan,
        no_hp: detail.guru.no_hp ?? "",
        alamat: detail.guru.alamat ?? "",
        email: detail.guru.email ?? "",
        username: detail.akun?.username ?? "",
        password: "",
      });

      if (statRes.ok) {
        const stat: StatistikResponse = await statRes.json();
        setStatistik(stat.summary);
        setPeriode({ bulan: stat.bulan, tahun: stat.tahun });
      }
    } catch (err) {
      setError("Gagal memuat data guru.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [nik]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateForm = (key: keyof FormState, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teachers/${nik}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setEditing(false);
      setNotice("Data guru berhasil disimpan.");
      setTimeout(() => setNotice(null), 3000);
      fetchAll();
    } catch (err) {
      console.error(err);
      window.alert("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 flex justify-center">
        <div className="w-97.5 min-h-[844px] flex items-center justify-center">
          <p className="text-sm text-slate-400">Memuat data…</p>
        </div>
      </div>
    );
  }

  if (error || !guru || !form) {
    return (
      <div className="bg-slate-50 flex justify-center">
        <div className="w-[390px] min-h-[844px] flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-red-500">{error ?? "Data tidak ditemukan."}</p>
          <button onClick={fetchAll} className="text-xs text-slate-500 underline">Coba lagi</button>
        </div>
      </div>
    );
  }

  const initials = getInitials(guru.nama_lengkap);
  const namaBulan = periode ? BULAN_NAMA[periode.bulan - 1] : "";

  return (
    <div className="bg-slate-50 flex justify-center">
      <div className="w-[390px] min-h-[844px] flex flex-col">
        <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-red-500">Teacher Detail</h1>
        </div>

        <div className="flex-1 px-4 pt-4 pb-10 overflow-y-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-xl font-bold text-rose-600">{initials}</span>
              </div>
              {editing ? (
                <input
                  type="text" value={form.nama_lengkap} onChange={(e) => updateForm("nama_lengkap", e.target.value)}
                  className="mt-3 w-full text-center bg-slate-100 rounded-lg px-2.5 py-1.5 text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-200"
                />
              ) : (
                <p className="mt-3 text-base font-bold text-slate-800">{guru.nama_lengkap}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">NIK- {guru.nik}</p>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <InfoRow icon={<Briefcase size={14} />} value={form.jabatan} editing={editing} onChange={(v) => updateForm("jabatan", v)} placeholder="Jabatan" />
              <InfoRow icon={<Phone size={14} />} value={form.no_hp} editing={editing} onChange={(v) => updateForm("no_hp", v)} placeholder="No. HP" />
              <InfoRow icon={<MapPin size={14} />} value={form.alamat} editing={editing} onChange={(v) => updateForm("alamat", v)} placeholder="Alamat" />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditing(true)} disabled={editing}
                className="flex-1 flex items-center justify-center gap-1.5 border border-red-300 text-red-500 text-sm font-semibold rounded-xl py-2.5 disabled:opacity-40 transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={handleSave} disabled={!editing || saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white text-sm font-semibold rounded-xl py-2.5 disabled:opacity-40 hover:bg-red-600 transition-colors"
              >
                <Save size={14} /> {saving ? "Menyimpan..." : "Save"}
              </button>
            </div>
          </div>

          {notice && (
            <div className="bg-slate-800 text-white text-xs text-center rounded-xl py-2 px-4 mt-3">{notice}</div>
          )}

          {/* Account Info Section */}
          <div className="mt-5">
            <h2 className="text-sm font-bold text-slate-800">Informasi Akun Guru</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {akun ? "Username & password login guru" : "Guru ini belum punya akun login — isi untuk membuatkan."}
            </p>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mt-2.5">
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Username</label>
                {editing ? (
                  <input
                    type="text" value={form.username} onChange={(e) => updateForm("username", e.target.value)}
                    className="w-full bg-slate-100 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200"
                  />
                ) : (
                  <p className="text-sm text-slate-700">{akun?.username ?? "Belum diatur"}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Password</label>
                {editing ? (
                  <>
                    <input
                      type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)}
                      placeholder={akun ? "Kosongkan jika tidak ingin mengubah" : "Wajib diisi untuk akun baru"}
                      className="w-full bg-slate-100 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {akun ? "Isi cuma kalau mau reset password guru ini." : "Akun belum ada, password wajib diisi."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-700 tracking-widest">{akun ? "••••••••" : "Belum diatur"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Statistik Bulan Ini</h2>
                <p className="text-xs text-slate-400 mt-0.5">Performa absensi {namaBulan} {periode?.tahun}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              <StatCard icon={<CheckCircle2 size={16} />} value={statistik?.on_time ?? 0} label="On Time" color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard icon={<Clock size={16} />} value={statistik?.late ?? 0} label="Late" color="text-amber-600" bg="bg-amber-50" />
              <StatCard icon={<CalendarOff size={16} />} value={statistik?.izin ?? 0} label="Leave" color="text-sky-600" bg="bg-sky-50" />
              <StatCard icon={<Thermometer size={16} />} value={statistik?.sakit ?? 0} label="Sick" color="text-purple-600" bg="bg-purple-50" />
              <StatCard icon={<XCircle size={16} />} value={statistik?.alpha ?? 0} label="Absent" color="text-red-600" bg="bg-red-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}