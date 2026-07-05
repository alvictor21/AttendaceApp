"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/src/meta/api";
import { ChevronLeft } from "lucide-react";

interface GuruDetail {
  nik: string;
  nama_lengkap: string;
  jabatan: string;
  no_hp: string | null;
}

interface PengajuanDetail {
  id: number;
  nik: string;
  tanggal: string;
  tanggal_selesai: string;
  jenis: string;
  keterangan: string | null;
  dokumen_pendukung: string | null;
}

interface AbsenDetail {
  id: number;
  nik: string;
  tanggal: string;
  jam_absen: string | null;
  status: string;
  foto: string | null;
}



function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeacherAttendanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const nik = params.nik as string;

  const [guru, setGuru] = useState<GuruDetail | null>(null);
  const [absen, setAbsen] = useState<AbsenDetail | null>(null);
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

 useEffect(() => {
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API.IZIN_DETAIL}/${nik}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        router.back();
        return;
      }

      setGuru(data.guru);
      setAbsen(data.absen);
      setPengajuan(data.pengajuan); // bisa null
    } catch (error) {
      console.error("Gagal ambil detail:", error);
    } finally {
      setLoading(false);
    }
  };

    fetchDetail();
  }, [nik]);

  const handleApprove = async () => {
    const konfirmasi = confirm("Setujui pengajuan izin ini?");
    if (!konfirmasi) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API.IZIN_APPROVE}/${nik}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);
      router.push("/admin/teachers");
    } catch (error) {
      console.error("Error approve:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const konfirmasi = confirm("Tolak pengajuan izin ini?");
    if (!konfirmasi) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API.IZIN_REJECT}/${nik}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);
      router.push("/admin/teachers");
    } catch (error) {
      console.error("Error reject:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 flex justify-center min-h-screen">
        <div className="w-full max-w-[390px] p-5 text-slate-400 text-sm">
          Memuat detail...
        </div>
      </div>
    );
  }

  if (!guru) {
  return (
    <div className="bg-slate-50 w-full min-h-screen">
      <div className="p-5 text-slate-400 text-sm">
        Data tidak ditemukan.
      </div>
    </div>
  );
}

  return (
  <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative">

    {/* Header */}
    <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
      >
        <ChevronLeft size={18} className="text-slate-600" />
      </button>
      <h1 className="text-lg font-bold text-rose-600">Attendance Details</h1>
    </div>

    <div className="px-4 pt-4 pb-10 space-y-3">

      {/* Profil guru */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-3">
          <span className="text-lg font-bold text-rose-500">
            {getInitials(guru.nama_lengkap)}
          </span>
        </div>
        <p className="font-bold text-slate-800 text-[15px]">{guru.nama_lengkap}</p>
        <p className="text-xs text-slate-400 mt-0.5">NIK: {guru.nik}</p>

        <div className="w-full border-t border-slate-100 my-3" />

        <p className="text-sm text-slate-600">{guru.jabatan}</p>
        {guru.no_hp && <p className="text-xs text-slate-400 mt-0.5">{guru.no_hp}</p>}

        <div className="flex gap-3 w-full mt-4">
          {/* Status Absen */}
          <div className="flex-1 bg-orange-400 rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/80 mb-1.5 font-medium uppercase tracking-wide">
              Status Absen
            </p>
            <div className="bg-white rounded-lg py-2">
              <span className="text-sm font-bold text-orange-600">
                {absen?.status ?? "-"}
              </span>
            </div>
          </div>

          {/* Bukti Pendukung */}
          <div className="flex-1 bg-orange-400 rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/80 mb-1.5 font-medium uppercase tracking-wide">
              Bukti Pendukung
            </p>
            <div className="bg-white rounded-lg py-2 flex items-center justify-center min-h-[36px]">
              {pengajuan?.dokumen_pendukung ? (
                <a
                  href={`http://127.0.0.1:8000/storage/${pengajuan.dokumen_pendukung}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-orange-600 underline"
                >
                  Lihat Dokumen
                </a>
              ) : absen?.foto ? (
                <a
                  href={`http://127.0.0.1:8000/storage/${absen.foto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-orange-600 underline"
                >
                  Lihat Foto
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Tidak ada</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keterangan Izin */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-800 text-center mb-4 text-[15px]">
          Keterangan Izin
        </h2>

        {pengajuan ? (
          <div className="space-y-2 text-sm text-slate-700 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Mulai Tanggal</span>
              <span className="font-semibold">{pengajuan.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sampai Tanggal</span>
              <span className="font-semibold">{pengajuan.tanggal_selesai}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alasan Izin</span>
              <span className="font-semibold">{pengajuan.jenis}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 mt-2">
                Catatan
              </label>
              <div className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-600 min-h-[80px] bg-slate-50">
                {pengajuan.keterangan || (
                  <span className="text-slate-300 italic">Tidak ada catatan</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 mb-4">
            <p className="text-sm text-slate-400 italic">
              Tidak ada pengajuan izin — absensi reguler
            </p>
            {absen?.jam_absen && (
              <p className="text-xs text-slate-400 mt-1">
                Jam absen: {absen.jam_absen.slice(0, 5)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={handleReject}
            disabled={processing}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white font-bold text-sm py-3 rounded-xl transition-colors"
          >
            Tolak
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-sm py-3 rounded-xl transition-colors"
          >
            Beri Izin
          </button>
        </div>
      </div>

    </div>
  </div>
);
}