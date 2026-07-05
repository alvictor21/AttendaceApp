<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\DataPengajuanIzin;
use App\Models\DataAbsensi;
use App\Models\DataGuru;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DetailIzin extends Controller
{

public function submitDetail(Request $request)
{
    $request->validate([
        'jenis'          => 'required|string',
        'tanggal'        => 'required|date',
        'tanggal_selesai' => 'nullable|date',
        'keterangan'     => 'nullable|string',
        'dokumen'        => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ]);

    $user = $request->user();
    $now = Carbon::now();

    $tanggalSelesai = $request->tanggal_selesai ?: $request->tanggal;

    $namaFile = null;

    if ($request->hasFile('dokumen')) {
        $file = $request->file('dokumen');
        $namaAsli = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $ekstensi = $file->getClientOriginalExtension();

        // Bersihkan nama asli dari karakter aneh
        $namaAsliBersih = preg_replace('/[^a-zA-Z0-9\-]/', '-', $namaAsli);
        $namaUserBersih = preg_replace('/[^a-zA-Z0-9\-]/', '', str_replace(' ', '-', $user->nama_user));

        // Format: namaasli_tanggal_namauser.ext
        $namaFile = $namaAsliBersih . '_' .
                    $now->format('Y-m-d') . '_' .
                    $namaUserBersih . '.' .
                    $ekstensi;

        $namaFile = $file->storeAs('dokumen-izin', $namaFile, 'public');
    }

    $pengajuan = DataPengajuanIzin::create([
        'nik'               => $user->nik,
        'tanggal'           => $request->tanggal,
        'tanggal_selesai'   => $tanggalSelesai,
        'jenis'             => $request->jenis,
        'status_pengajuan'  => 'Menunggu',
        'keterangan'        => $request->keterangan,
        'dokumen_pendukung' => $namaFile,
    ]);

    return response()->json([
        'message' => 'Pengajuan izin berhasil dikirim lengkap dengan detail.',
        'data'    => $pengajuan,
    ], 201);
}

public function detailByNik(string $nik)
{
    $guru = DataGuru::where('nik', $nik)->first();

    if (!$guru) {
        return response()->json(['message' => 'Guru tidak ditemukan.'], 404);
    }

    $tanggalHariIni = Carbon::now('Asia/Jakarta')->toDateString();

    $absenHariIni = DataAbsensi::where('nik', $nik)
        ->whereDate('tanggal', $tanggalHariIni)
        ->first();

    // Cari pengajuan izin yang tanggalnya cocok dengan tanggal absen hari ini
    // ATAU ambil yang paling baru kalau absen tidak ada
    $tanggalCari = $absenHariIni ? $absenHariIni->tanggal : $tanggalHariIni;

    $pengajuan = DataPengajuanIzin::where('nik', $nik)
        ->whereDate('tanggal', $tanggalCari)
        ->latest()
        ->first();

    // Kalau tidak ketemu juga, coba ambil pengajuan terbaru hari ini
    if (!$pengajuan) {
        $pengajuan = DataPengajuanIzin::where('nik', $nik)
            ->whereDate('created_at', $tanggalHariIni)
            ->latest()
            ->first();
    }

    return response()->json([
        'guru' => [
            'nik'          => $guru->nik,
            'nama_lengkap' => $guru->nama_lengkap,
            'jabatan'      => $guru->jabatan,
            'no_hp'        => $guru->no_hp,
        ],
        'absen'    => $absenHariIni,
        'pengajuan' => $pengajuan,
    ]);
}

public function approve(Request $request, string $nik)
{
    $absen = DataAbsensi::where('nik', $nik)
        ->whereDate('tanggal', Carbon::now('Asia/Jakarta')->toDateString())
        ->first();

    if (!$absen) {
        return response()->json(['message' => 'Data absensi tidak ditemukan.'], 404);
    }

    // Kalau statusnya Pengajuan Izin, cek jenis izinnya
    if ($absen->status === 'Pengajuan Izin') {
        $pengajuan = DataPengajuanIzin::where('nik', $nik)->latest()->first();
        $statusBaru = ($pengajuan && $pengajuan->jenis === 'Sick Leave') ? 'Sakit' : 'Izin';
    } else {
        // On Time, Late, Alpha — approve berarti biarkan status tetap
        $statusBaru = $absen->status;
    }

    $absen->update(['status' => $statusBaru]);

    return response()->json(['message' => 'Absensi disetujui.']);
}

public function reject(Request $request, string $nik)
{
    $affected = DataAbsensi::where('nik', $nik)
        ->whereDate('tanggal', Carbon::now('Asia/Jakarta')->toDateString())
        ->update(['status' => 'Alpha']);

    if (!$affected) {
        return response()->json(['message' => 'Data absensi tidak ditemukan.'], 404);
    }

    return response()->json(['message' => 'Absensi ditolak, status diubah ke Alpha.']);
}
}
