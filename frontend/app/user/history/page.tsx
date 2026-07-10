"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "@/src/meta/api";

// ── Types ──────────────────────────────────────────────────────────────────────
type StatusBackend = "On Time" | "Pengajuan Izin" | "Late" | "Sakit" | "Izin" | "Alpha";

interface AttendanceRecord {
  id: number;
  nik: string;
  tanggal: string;     // format "2026-06-19"
  jam_absen: string | null;
  status: StatusBackend;
}

interface AttendanceSummary {
  total_hari: number;
  on_time: number;
  late: number;
  sakit: number;
  izin: number;
  alpha: number;
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const statusConfig: Record<StatusBackend, { pill: string; dateBg: string; dateText: string }> = {
  "On Time": {
    pill:     "bg-green-600 text-white",
    dateBg:   "bg-rose-50",
    dateText: "text-rose-700",
  },
  "Pengajuan Izin": {
    pill:     "bg-gray-600 text-white",
    dateBg:   "bg-rose-50",
    dateText: "text-rose-700",
  },
  "Late": {
    pill:     "bg-rose-600 text-white",
    dateBg:   "bg-gray-50",
    dateText: "text-gray-700",
  },
  "Sakit": {
    pill:     "bg-amber-500 text-white",
    dateBg:   "bg-gray-50",
    dateText: "text-gray-700",
  },
  "Izin": {
    pill:     "bg-blue-500 text-white",
    dateBg:   "bg-gray-50",
    dateText: "text-gray-700",
  },
  "Alpha": {
    pill:     "bg-gray-500 text-white",
    dateBg:   "bg-gray-50",
    dateText: "text-gray-500",
  },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AttendanceHistoryPage() {
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  // ── State bulan & tahun yang sedang dipilih (default: bulan & tahun sekarang) ──
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // ── State untuk popover picker ──
  const [showPicker, setShowPicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  const currentMonthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/attendance/history?bulan=${selectedMonth}&tahun=${selectedYear}`
        );
        const data = await response.json();

        setRecords(data.records ?? []);
        setSummary(data.summary ?? null);
      } catch (error) {
        console.error("Gagal ambil riwayat absensi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedMonth, selectedYear]);

  // helper untuk format tanggal "2026-06-19" jadi { date: 19, month: "JUN", day: "Friday" }
  const formatDate = (tanggal: string) => {
    const d = new Date(tanggal + "T00:00:00");
    return {
      date: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: d.toLocaleString("en-US", { weekday: "long" }),
    };
  };

  const filtered = records.filter((r) => {
    const { day } = formatDate(r.tanggal);
    return (
      day.toLowerCase().includes(query.toLowerCase()) ||
      r.status.toLowerCase().includes(query.toLowerCase())
    );
  });

  const openPicker = () => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setShowPicker(true);
  };

  const applyPicker = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setShowPicker(false);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setShowPicker(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 font-sans">

      {/* ── Header ── */}
      <div className="bg-white px-5 pt-10 pb-5 border-b border-gray-100 relative">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{currentMonthLabel}</h1>
          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-white shadow-sm active:bg-gray-50"
          >
            <CalendarDays size={14} className="text-rose-600" strokeWidth={2} />
            Change Month
          </button>
        </div>

        {/* ── Popover Month/Year Picker ── */}
        {showPicker && (
          <>
            {/* backdrop buat nutup popover kalau klik luar */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute right-5 top-20 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setTempYear((y) => y - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
                >
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                <span className="text-[14px] font-bold text-gray-900">{tempYear}</span>
                <button
                  onClick={() => setTempYear((y) => y + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
                >
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {MONTH_NAMES.map((name, idx) => {
                  const monthNum = idx + 1;
                  const isSelected = monthNum === tempMonth;
                  return (
                    <button
                      key={name}
                      onClick={() => setTempMonth(monthNum)}
                      className={`text-[11px] font-semibold py-2 rounded-lg transition ${
                        isSelected
                          ? "bg-rose-600 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={goToCurrentMonth}
                  className="flex-1 text-[12px] font-semibold text-gray-500 py-2 rounded-lg hover:bg-gray-50"
                >
                  This Month
                </button>
                <button
                  onClick={applyPicker}
                  className="flex-1 text-[12px] font-bold text-white bg-rose-600 py-2 rounded-lg active:bg-rose-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Summary Stats ── */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-3 divide-x divide-gray-200 overflow-hidden">
          <div className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-3xl font-extrabold text-gray-900">{summary?.total_hari ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center leading-tight">
              Total<br />Days
            </span>
          </div>
          <div className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-3xl font-extrabold text-green-600">{summary?.on_time ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              On Time
            </span>
          </div>
          <div className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-3xl font-extrabold text-rose-600">{summary?.late ?? 0}</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              Late
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ── Search + Filter ── */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search records..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
            />
          </div>
          <button className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm active:bg-gray-50 shrink-0">
            <SlidersHorizontal size={17} className="text-gray-500" strokeWidth={2} />
          </button>
        </div>

        {/* ── Records List ── */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <p className="text-[13px] text-gray-400 font-medium">Memuat riwayat absensi...</p>
            </div>
          ) : (
            <>
              {filtered.map((r) => {
                const cfg = statusConfig[r.status];
                const { date, month, day } = formatDate(r.tanggal);
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-sm"
                  >
                    {/* Date badge */}
                    <div
                      className={`w-12 rounded-xl flex flex-col items-center justify-center py-2 shrink-0 ${cfg.dateBg}`}
                    >
                      <span className={`text-xl font-extrabold leading-none ${cfg.dateText}`}>
                        {date}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 tracking-wide mt-0.5">
                        {month}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900">{day}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        Check-In: {r.jam_absen ? r.jam_absen.slice(0, 5) : "--"}
                      </p>
                    </div>

                    {/* Status pill */}
                    <span
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 uppercase ${cfg.pill}`}
                    >
                      {r.status}
                    </span>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-2">
                  <Search size={32} className="text-gray-300" strokeWidth={1.5} />
                  <p className="text-[13px] text-gray-400 font-medium">No records found</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}