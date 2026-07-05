"use client";

import { useState, useEffect, useCallback } from "react";
import { API } from "@/src/meta/api";
import { Download, FileText, Filter } from "lucide-react";

// ── Types ──────────────────────────────────────────────
type StatusFilter = "All" | "On Time" | "Late" | "Sakit" | "Izin" | "Alpha" | "Pengajuan Izin";

interface Summary {
  on_time: number;
  late: number;
  sakit: number;
  izin: number;
  alpha: number;
  pengajuan_izin: number;
}

interface Record {
  nik: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  jam_absen: string | null;
  status: string;
}

// ── Status Config ──────────────────────────────────────
const statusOptions: StatusFilter[] = [
  "All", "On Time", "Late", "Sakit", "Izin", "Alpha", "Pengajuan Izin"
];

const statusBadge: Record<string, string> = {
  "On Time":       "bg-emerald-100 text-emerald-700",
  "Late":          "bg-amber-100 text-amber-700",
  "Sakit":         "bg-red-100 text-red-600",
  "Izin":          "bg-blue-100 text-blue-700",
  "Alpha":         "bg-slate-100 text-slate-600",
  "Pengajuan Izin": "bg-orange-100 text-orange-700",
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// ── Main Page ──────────────────────────────────────────
export default function LaporanPage() {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; 9
  const currentYear = now.getFullYear();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);

  const prevMonth = () => {
  if (viewMonth === 1) {
    setViewMonth(12);
    setViewYear(y => y - 1);
  } else {
    setViewMonth(m => m - 1);
  }
  setSelectedDay(1);
};

const nextMonth = () => {
  // Tidak boleh maju melebihi bulan sekarang
  if (viewYear === currentYear && viewMonth === currentMonth) return;
  if (viewMonth === 12) {
    setViewMonth(1);
    setViewYear(y => y + 1);
  } else {
    setViewMonth(m => m + 1);
  }
  setSelectedDay(1);
};

const isCurrentMonth = viewMonth === currentMonth && viewYear === currentYear;
const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const fetchLaporan = useCallback(async (day: number, status: StatusFilter) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      bulan: String(viewMonth),
      tahun: String(viewYear),
      tanggal: String(day),
      ...(status !== "All" && { status }),
    });

    const response = await fetch(`${API.LAPORAN}?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await response.json();

    setSummary(data.summary);
    setRecords(data.records);
  } catch (error) {
    console.error("Gagal fetch laporan:", error);
  } finally {
    setLoading(false);
  }
}, [viewMonth, viewYear]);

useEffect(() => {
  fetchLaporan(selectedDay, selectedStatus);
}, [selectedDay, selectedStatus, fetchLaporan]);

  const handleExportXLSX = async () => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      bulan: String(viewMonth),
      tahun: String(viewYear),
    });

    const response = await fetch(`${API.LAPORAN_EXPORT_XLSX}?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
      alert("Gagal export Excel.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-absen-${MONTH_NAMES[viewMonth - 1]}-${viewYear}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error export Excel:", error);
    alert("Terjadi kesalahan saat export.");
  }
};

  return (
    <div className="w-[390px] h-auto pb-32 flex flex-col relative">

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Laporan Absensi</h1>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ‹
          </button>
          <p className="text-sm font-bold text-slate-700">
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </p>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── 5 Card Summary ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "On Time", value: summary?.on_time ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Late",    value: summary?.late ?? 0,    color: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "Sakit",   value: summary?.sakit ?? 0,   color: "text-red-600",     bg: "bg-red-50"     },
            { label: "Izin",    value: summary?.izin ?? 0,    color: "text-blue-600",    bg: "bg-blue-50"    },
            { label: "Alpha",   value: summary?.alpha ?? 0,   color: "text-slate-600",   bg: "bg-slate-100"  },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-2xl p-3 text-center`}>
              <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filter Tanggal ── */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 pr-4">
            Filter Tanggal
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                  selectedDay === day
                    ? "bg-rose-600 text-white"
                    : day === currentDay
                    ? "bg-rose-100 text-rose-600"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter Status ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pr-4">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors  ${
                selectedStatus === s
                  ? "bg-rose-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Records List ── */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Data Tanggal {selectedDay} — {selectedStatus === "All" ? "Semua Status" : selectedStatus}
          </p>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <p className="text-sm text-slate-400">Tidak ada data untuk filter ini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.nama}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.jabatan}</p>
                    <p className="text-xs text-slate-400">
                      {r.jam_absen ? r.jam_absen.slice(0, 5) : "—"}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${statusBadge[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Export Buttons ── */}
        <div className="flex gap-3 pt-2">
          <button
          onClick={handleExportXLSX}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition-colors"
        >
          <Download size={16} />
          Export XLSX
        </button>
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 bg-slate-300 text-slate-500 font-bold text-sm py-3.5 rounded-xl cursor-not-allowed"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 pb-2">
          Export PDF akan tersedia setelah format tabel dikonfirmasi.
        </p>

      </div>
    </div>
  );
}