"use client";
import { API } from "@/src/meta/api";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  CalendarOff,
  Thermometer,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type AttendanceStatus = "Present" | "Late" | "Absent" | "Leave" | "Sick" | "PengajuanIzin";

interface Teacher {
  nik: string;
  nama_lengkap: string;
  jabatan: string;
  status: AttendanceStatus;
  jam_absen: string | null;
  tanggal: string | null;
}

interface ApiResponse {
  date: string;
  reset_at: string;       // ISO 8601
  reset_at_unix: number;  // unix timestamp (seconds)
  teachers: Teacher[];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Ambil 2 inisial dari nama lengkap */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-200",
  "bg-amber-200",
  "bg-purple-200",
  "bg-sky-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-pink-200",
  "bg-indigo-200",
  "bg-lime-200",
];

function avatarColor(nik: string): string {
  let hash = 0;
  for (const ch of nik) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Hitung sisa detik sampai waktu reset */
function secondsUntil(unixTs: number): number {
  return Math.max(0, unixTs - Math.floor(Date.now() / 1000));
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────

const statusConfig: Record<
  AttendanceStatus,
  { label: string; badge: string; dot: string; icon: React.ReactNode }
> = {
  Present: {
    label: "Present",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 size={11} />,
  },
  Late: {
    label: "Late",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    icon: <Clock size={11} />,
  },
  Absent: {
    label: "Absent",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    icon: <HelpCircle size={11} />,
  },
  Leave: {
    label: "Leave",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    icon: <CalendarOff size={11} />,
  },
  Sick: {
    label: "Sick",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
    icon: <Thermometer size={11} />,
  },
  PengajuanIzin: {
    label: "Proses Izin",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
    icon: <Clock size={11} />,
  },
};

const filterTabs: Array<"All" | AttendanceStatus> = [
  "All",
  "Present",
  "Late",
  "Leave",
  "Sick",
  "PengajuanIzin"
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function Avatar({
  initials,
  color,
  dot,
}: {
  initials: string;
  color: string;
  dot: string;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}
      >
        <span className="text-sm font-semibold text-slate-700">{initials}</span>
      </div>
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${dot}`}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TeacherCard({ teacher, onClick }: { teacher: Teacher; onClick: () => void }) {
  
  const cfg = statusConfig[teacher.status];
  const initials = getInitials(teacher.nama_lengkap);
  const color = avatarColor(teacher.nik);

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform" onClick={onClick}>
      <Avatar initials={initials} color={color} dot={cfg.dot} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {teacher.nama_lengkap}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">NIK- {teacher.nik}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500">{teacher.jabatan}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <StatusBadge status={teacher.status} />
        {teacher.jam_absen ? (
          <span className="text-[11px] text-slate-400 font-medium">
            {teacher.jam_absen}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No record</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function TeacherDirectoryPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [resetAtUnix, setResetAtUnix] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);

  const [activeFilter, setActiveFilter] = useState<"All" | AttendanceStatus>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref agar fetchData terbaru bisa dipanggil dari timer
  const fetchRef = useRef<() => void>(() => {});

  // ── Fetch dari API Laravel ──────────────────
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/attendance/detail", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      setTeachers(data.teachers);
      setAttendanceDate(data.date);
      setResetAtUnix(data.reset_at_unix);
      setCountdown(secondsUntil(data.reset_at_unix));
    } catch (err) {
      setError("Gagal memuat data. Periksa koneksi ke server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  fetchRef.current = fetchData;

  // ── Initial fetch ───────────────────────────
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Countdown ticker + auto-reset jam 3 pagi ─
  useEffect(() => {
    if (!resetAtUnix) return;

    const tick = setInterval(() => {
      const secs = secondsUntil(resetAtUnix);
      setCountdown(secs);

      // Ketika hitungan mundur habis → waktu reset tiba → fetch ulang
      if (secs === 0) {
        // Tunggu 2 detik agar server sudah benar-benar pindah hari
        setTimeout(() => fetchRef.current(), 2000);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [resetAtUnix]);

  // ── Filter ──────────────────────────────────
  const filtered = teachers.filter((t) => {
    const matchFilter = activeFilter === "All" || t.status === activeFilter;
    const matchSearch =
      t.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      t.nik.includes(search);
    return matchFilter && matchSearch;
  });

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="bg-slate-50 flex justify-center">
      <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative">

        {/* ── Header ── */}
        <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
          {/* Countdown banner */}
          {resetAtUnix > 0 && (
            <div className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2 mb-3">
              <div>
                <p className="text-[10px] text-slate-400 leading-none">
                  Sesi absen: {attendanceDate}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Reset berikutnya pukul 03:00
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <span className="text-xs font-mono font-bold text-white">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3.5 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau NIK…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === tab
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-slate-800">
                Teacher Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {loading
                  ? "Memuat data…"
                  : `Menampilkan ${filtered.length} guru hari ini`}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Manual refresh */}
              <button
                onClick={() => { setLoading(true); fetchData(); }}
                className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors">
                <SlidersHorizontal size={13} />
                Sort
              </button>
            </div>
          </div>

          {/* State: loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl px-4 py-3.5 h-[76px] animate-pulse border border-slate-100"
                />
              ))}
            </div>
          )}

          {/* State: error */}
          {!loading && error && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => { setLoading(true); fetchData(); }}
                className="mt-3 text-xs text-slate-500 underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* State: data */}
          {!loading && !error && (
            <div
              className="flex flex-col gap-3"
            >
              {filtered.length > 0 ? (
                filtered.map((teacher) => (
                  <TeacherCard key={teacher.nik} teacher={teacher} onClick={() => router.push(`/admin/teachers/TeacherAttendanceDetails/${teacher.nik}`)} />
                ))
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm">Tidak ada guru ditemukan.</p>
                  <p className="text-xs mt-1">Coba filter atau nama lain.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}