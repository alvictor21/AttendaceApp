"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDistanceToSchool } from "@/src/hooks/useDistanceToSchool";
import { getCurrentUser } from "@/src/services/auth.services";
import CameraCapture from "@/src/components/CameraCapture";
import { API } from "@/src/meta/api";
import {
  Navigation,
  MapPin,
  Briefcase,
  ClipboardList,
  MapPinned,
  Camera, 
  X
} from "lucide-react";

interface User {
  id: number;
  nama_user: string;
  username: string;
  role: string;
  nik: string;
  jabatan: string | null; // dari relasi dataGuru
}

interface AbsensiToday {
  id: number;
  nik: string;
  tanggal: string;
  jam_absen: string;
  jam_keluar: string | null;
  status: "On Time" | "Late" | "Sakit" | "Izin" | "Alpha" | "Pengajuan Izin";
}



const SchoolMap = dynamic(() => import("@/src/components/SchoolMap"), {
  ssr: false,
  loading: () => <div className="h-44 bg-gray-200 rounded-2xl animate-pulse" />,
});

export default function TeacherDashboard() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { distance, isWithinRadius, loading, error, userCoords } = useDistanceToSchool();
  const [todayAttendance, setTodayAttendance] = useState<AbsensiToday | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [todayIzin, setTodayIzin] = useState<AbsensiToday | null>(null);
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
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
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

      if (data.sudah_absen && data.data.status !== "Pengajuan Izin") {
        setTodayAttendance(data.data);
      } else if (data.sudah_absen && data.data.status === "Pengajuan Izin") {
        setTodayIzin(data.data); // kalau Pengajuan Izin, set ke todayIzin
      }
    } catch (error) {
      console.error("Gagal cek status absen:", error);
    } finally {
      setCheckingStatus(false);
    }
  };
  fetchTodayStatus();
}, []);

  const handleAjukanIzin = async () => {
    // Tampilkan alert dulu
    alert("Silahkan Masuk Ke Halaman Pengajuan Izin (Leave Permission) untuk mengisi keterangan.");

    try {
      const response = await fetch("/api/leave/store", {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTodayIzin(data.data);
    } catch (error) {
      console.error("Error pengajuan izin:", error);
    }
  };

  const handleBatalIzin = async () => {
    const konfirmasi = confirm("Batalkan pengajuan izin hari ini?");
    if (!konfirmasi) return;

    try {
      const response = await fetch("/api/leave/cancel", {
        method: "DELETE"
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTodayIzin(null);
    } catch (error) {
      console.error("Error batal izin:", error);
    }
  };

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
 


    useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error(error);
      }
    }

    loadUser();
  }, []);

    if (!user) {
      return <div>Loading...</div>;
    }

    
  
  return (
    <div className="bg-gray-100 min-h-screen pb-24 font-sans">

      {/* ── Header ── */}
      <div className="bg-white px-5 pt-10 pb-5">
        <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Welcome Back,
        </p>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {user.nama_user}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          {/* Subject badge */}
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {user.jabatan}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

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

            {/* Tombol Izin Absen — hanya muncul kalau belum absen dan belum ada pengajuan izin */}
            {!todayAttendance && (
              todayIzin ? (
                <button
                  onClick={handleBatalIzin}
                  className="w-full mt-1 font-semibold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  ⏳ Menunggu Konfirmasi Admin/Kepala Sekolah (klik untuk batal izin)
                </button>
              ) : (
                <button
                  onClick={handleAjukanIzin}
                  className="w-full mt-1 font-semibold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-2 bg-orange-400 text-white hover:bg-orange-500 transition-colors"
                >
                  📋 Izin Absen
                </button>
              )
            )}
          </div>
        )}
        </div>

        {/* ── Quick Actions ── */}
        
        <div className="flex flex-row w-full justify-center items-center gap-3">
          {/* Leave Permission */}
          {todayIzin ? (
              <button className="bg-white rounded-2xl w-full p-4 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50 transition-colors"  onClick={() => router.push("/user/report")}>
              <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center">
                <ClipboardList size={20} className="text-rose-700" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-900">Leave Permission</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Formal Request</p>
              </div>
            </button>
          ) : (
            <button className="bg-white rounded-2xl w-full p-4 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center">
                <ClipboardList size={20} className="text-rose-700" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-500">Leave Permission</p>
                <p className="text-[7px] text-gray-500 mt-0.5">Formal Request</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-900">Silahkan Tekan Izin Terlebih Dahulu </p>
              </div>
            </button>
          )}
          
        </div>

        {/* ── This Month ── */}
        <div>
          <p className="text-[15px] font-bold text-gray-900 mb-2 px-0.5">This Month</p>
          <div className="grid grid-cols-2 gap-3">
            {/* On Time */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">On Time</p>
              <p className="text-3xl font-extrabold text-green-600 mb-2">92%</p>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>

            {/* Lates */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">Lates</p>
              <p className="text-3xl font-extrabold text-rose-700">2</p>
            </div>
          </div>
        </div>

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
                

        {/* ── Map Preview ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <SchoolMap userCoords={userCoords} />
      </div>

      </div>
    </div>
  );
}