"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDistanceToSchool } from "@/src/hooks/useDistanceToSchool";
import {
  Navigation,
  MapPin,
  Briefcase,
  ClipboardList,
  MapPinned,
  Camera, 
  X
} from "lucide-react";
import { API } from "@/src/meta/api";
import CameraCapture from "@/src/components/CameraCapture";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AttendanceBar from "@/src/components/AttedanceBar"
import AdminProfileCard from "@/src/components/AdminProfileCard";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarOff,
  Thermometer,
  RefreshCw,
} from "lucide-react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);

// ── Types ─────────────────────────────────────────────────────────────────────
type StatusType = "On Time" | "Late" | "Absent";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  check?: boolean;
}

interface Activity {
  name: string;
  time: string;
  subject: string;
  status: StatusType;
  avatar: string;
}

interface AbsensiToday {
  id: number;
  nik: string;
  tanggal: string;
  jam_absen: string;
  jam_keluar: string | null;
  status: "On Time" | "Late" | "Sakit" | "Izin" | "Alpha";
}

// ── Data ──────────────────────────────────────────────────────────────────────


const activities: Activity[] = [
  { name: "John Smith",  time: "08:12 AM", subject: "Mathematics",  status: "On Time", avatar: "JS" },
  { name: "Maria Doe",   time: "08:45 AM", subject: "English Lit.", status: "Late",    avatar: "MD" },
  { name: "Robert King", time: "09:22 AM", subject: "Physics",      status: "Absent",  avatar: "RK" },
];

const statusStyles: Record<StatusType, string> = {
  "On Time": "bg-green-100 text-green-700",
  "Late":    "bg-yellow-100 text-yellow-700",
  "Absent":  "bg-red-100 text-red-700",
};

const avatarBg: Record<string, string> = {
  JS: "bg-rose-700",
  MD: "bg-violet-700",
  RK: "bg-cyan-600",
};

interface StatistikHariIni {
    on_time: number
    late: number
    sakit: number
    izin: number
    alpha: number
}

const SchoolMap = dynamic(() => import("@/src/components/SchoolMap"), {
  ssr: false,
  loading: () => <div className="h-44 bg-gray-200 rounded-2xl animate-pulse" />,
});

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    //Absen Kepala Sekolah
    const router = useRouter();
    const [showCamera, setShowCamera] = useState(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
    const { distance, isWithinRadius, loading, error, userCoords } = useDistanceToSchool();
    const [todayAttendance, setTodayAttendance] = useState<AbsensiToday | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isAfter2PM, setIsAfter2PM] = useState(false);

    useEffect(() => {
      const checkTime = () => {
        const now = new Date();
        setIsAfter2PM(now.getHours() >= 14);
      };
      checkTime(); // cek langsung saat mount
      const interval = setInterval(checkTime, 60000); // cek tiap menit
      return () => clearInterval(interval);
    }, []);

    const handleCheckOut = async () => {
      const konfirmasi = confirm("Konfirmasi checkout sekarang?");
      if (!konfirmasi) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/attendance/check-out", {
          method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        // Update state todayAttendance dengan jam_keluar yang baru
        setTodayAttendance(prev => prev ? { ...prev, jam_keluar: data.data.jam_keluar } : prev);
        alert(data.message);
      } catch (error) {
        console.error("Error checkout:", error);
      }
    };

    useEffect(() => {
    const fetchTodayStatus = async () => {
    try {
        const response = await fetch("/api/attendance/today");
        const data = await response.json();

        if (data.sudah_absen) {
          setTodayAttendance(data.data);
        }
      } catch (error) {
        console.error("Gagal cek status absen:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

      fetchTodayStatus();
    }, []);
    
    const handleCheckIn = async () => {

    if (!selfieFile) {
      alert("Ambil foto selfie dulu sebelum absen.");
      return;
    }
    
    try {


      const formData = new FormData();
      formData.append("foto", selfieFile);

      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTodayAttendance(data.data);
      setSelfieFile(null);
      setSelfiePreviewUrl(null);
      alert(data.message);
      // bisa juga update state lokal di sini, misal disable tombol setelah berhasil
      setTodayAttendance(data.data);
    } catch (error) {
      console.error("Error check-in:", error);
    }
  };

    const [totalGuru, setTotalGuru] = useState(0)
    const [statistikHariIni, setStatistikHariIni] =
    useState<StatistikHariIni>({
        on_time: 0,
        late: 0,
        sakit: 0,
        izin: 0,
        alpha: 0
    })

    useEffect(() => {
        const getTotalGuru = async () => {
            try {
                const response = await axios.get(
                    "/api/dashboard/total-guru"
                )

                setTotalGuru(response.data.total_guru)
            } catch (error) {
                console.error("Gagal mengambil data guru:", error)
            }
        }

        getTotalGuru()
    }, [])

    useEffect(() => {
      const getStatistikHariIni = async () => {
          try {
              const response = await axios.get(
                  "/api/dashboard/statistik"
              )

              setStatistikHariIni(response.data)
          } catch (error) {
              console.error("Gagal mengambil statistik:", error)
          }
      }

      getStatistikHariIni()
    }, [])

    const stats: StatItem[] = [
    { label: "Total Teachers", value: totalGuru, icon: Users,       colorClass: "text-rose-700",   bgClass: "bg-rose-50" },
    { label: "Present Today",  value: statistikHariIni.on_time,  icon: UserCheck,   colorClass: "text-green-600",  bgClass: "bg-green-50", check: true },
    { label: "Not Present",    value:  statistikHariIni.alpha,  icon: UserX,       colorClass: "text-rose-700",   bgClass: "bg-rose-50" },
    { label: "Late Today",     value:  statistikHariIni.late,   icon: Clock,       colorClass: "text-amber-600",  bgClass: "bg-amber-50" },
    { label: "Sick Leave",     value: statistikHariIni.sakit,   icon: Thermometer, colorClass: "text-cyan-600",   bgClass: "bg-cyan-50" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen pb-20 w-full flex flex-col">

      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-bold text-gray-900">Welcome Admin</p>
            <p className="text-xs text-gray-400 mt-0.5">Tuesday, October 24, 2023</p>
          </div>
          <button className="flex items-center gap-1.5 bg-rose-700 text-white rounded-lg px-3.5 py-2 text-[13px] font-semibold">
            <RefreshCw size={14} />
            Sync
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, colorClass, bgClass, check }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-[10px] ${bgClass} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={colorClass} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[22px] font-bold text-gray-900 leading-tight">
                  {value}
                  {check && (
                    <span className="text-sm text-green-600 ml-1">✓</span>
                  )}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <AdminProfileCard />

        {/* ── School Proximity Card ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-rose-700" strokeWidth={2.2} />
              <span className="text-[13px] font-bold text-gray-900">School Proximity</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPinned size={18} className="text-gray-400" strokeWidth={1.8} />
            </div>
          </div>

          {/* Distance */}
          {/* Distance */}
          {loading && (
            <p className="text-sm text-gray-400 mb-3">Mencari lokasi Anda...</p>
          )}

          {error && (
            <p className="text-sm text-rose-600 mb-3">{error}</p>
          )}

          {distance !== null && (
            <>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-gray-900">{distance}</span>
                <span className="text-sm text-gray-500 ml-1.5">meters to school gate</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-4">
                {isWithinRadius
                  ? "You are within the verified attendance zone."
                  : "You are outside the attendance zone."}
              </p>
            </>
          )}

        {/* Check In Button */}
        {todayAttendance ? (
          <div className="space-y-2">
            {/* Badge status absen */}
            <div className="w-full bg-amber-400 text-amber-900 font-bold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 text-center">
              Sudah melakukan absen dengan status: {todayAttendance.status}
            </div>

            {/* Tombol Checkout */}
            {todayAttendance.jam_keluar ? (
              <div className="w-full bg-slate-100 text-slate-500 font-semibold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2">
                ✓ Checkout pukul {todayAttendance.jam_keluar.slice(0, 5)}
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={!isAfter2PM && !isWithinRadius}
                className={`w-full font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 ${
                  isAfter2PM
                    ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAfter2PM ? "🚪 Check Out" : "🔒 Check Out (tersedia pukul 14:00) & Harus Berada Di Zona Sekolah"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Preview selfie kalau sudah diambil */}
            {selfiePreviewUrl && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden">
                <img
                  src={selfiePreviewUrl}
                  alt="Selfie preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => { setSelfieFile(null); setSelfiePreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}

            {/* Tombol Ambil Foto */}
            {!selfieFile && (
              <button
                disabled={!isWithinRadius}
                onClick={() => setShowCamera(true)}
                className={`w-full font-bold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 ${
                  isWithinRadius
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Camera size={18} strokeWidth={2.2} />
                Ambil Foto Selfie
              </button>
            )}

            {/* Tombol Check In — hanya aktif setelah foto diambil */}
            <button
              disabled={!isWithinRadius || !selfieFile}
              onClick={handleCheckIn}
              className={`w-full font-bold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 ${
                isWithinRadius && selfieFile
                  ? "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <MapPin size={18} strokeWidth={2.2} />
              Check In Now
            </button>
          </div>
        )}

        {/* Komponen kamera — muncul fullscreen kalau showCamera = true */}
        {showCamera && (
          <CameraCapture
            onPhotoTaken={(file) => {
              setSelfieFile(file);
              setSelfiePreviewUrl(URL.createObjectURL(file));
              setShowCamera(false);
            }}
            onCancel={() => setShowCamera(false)}
          />
        )}
        </div>

      

        {/* ── Map Preview ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm z-0">
        <SchoolMap userCoords={userCoords} />
      </div>
      
      </div>
    </div>
  );
}