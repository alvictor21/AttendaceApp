<?php

// app/Http/Controllers/Api/AbsensiController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataAbsensi;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    public function checkIn(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120', // max 5MB
        ]);
        $user = $request->user(); // identitas dari token Sanctum, aman dari pemalsuan

        $now = Carbon::now();
        $tanggalHariIni = $now->format('Y-m-d');
        $jamSekarang = $now->format('H:i:s');

        // 1. Cek apakah sudah ada absensi hari ini
        $sudahAbsen = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggalHariIni)
            ->exists();

        if ($sudahAbsen) {
            return response()->json([
                'message' => 'Anda sudah melakukan absen hari ini.',
            ], 409);
        }

         $namaUser = str_replace(' ', '-', $user->nama_user);
        $namaFile = $now->format('Y-m-d') . '_' .
                    $now->locale('id')->isoFormat('dddd') . '_' .
                    $now->format('H-i') . '_' .
                    $namaUser . '.' .
                    $request->file('foto')->getClientOriginalExtension();

        $path = $request->file('foto')->storeAs('foto-absen', $namaFile, 'public');

        // 2. Tentukan status berdasarkan jam
        $jam = $now->format('H:i');

        if ($jam >= '03:00' && $jam < '08:00') {
            $status = 'On Time';
        } elseif ($jam >= '08:00' && $jam < '12:00') {
            $status = 'Late';
        } else {
            $status = 'Alpha';
        }

        // 3. Simpan ke database
        $absensi = DataAbsensi::create([
            'nik'        => $user->nik,
            'tanggal'    => $tanggalHariIni,
            'jam_absen'  => $jamSekarang,
            'status'     => $status,
            'foto'      => $path
        ]);

        // Tambahkan pengecekan ini sebelum simpan absen
        $sudahPengajuanIzin = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggalHariIni)
            ->where('status', 'Pengajuan Izin')
            ->exists();

        if ($sudahPengajuanIzin) {
            return response()->json([
                'message' => 'Anda sudah mengajukan izin hari ini. Batalkan izin terlebih dahulu untuk bisa check-in.',
            ], 409);
}

        return response()->json([
            'message' => 'Absen berhasil dicatat.',
            'data'    => $absensi,
        ], 201);
    }

    public function today(Request $request)
    {
        $user = $request->user();
        $tanggalHariIni = Carbon::now()->format('Y-m-d');

        $absensi = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggalHariIni)
            ->first();

        return response()->json([
            'sudah_absen' => $absensi !== null,
            'data'        => $absensi,
        ]);
    }

    // app/Http/Controllers/Api/AbsensiController.php

    public function history(Request $request)
    {
        $user = $request->user();

        // ambil parameter bulan & tahun dari query string, default ke bulan & tahun sekarang
        $bulan = $request->query('bulan', Carbon::now()->format('m'));
        $tahun = $request->query('tahun', Carbon::now()->format('Y'));

        $absensi = DataAbsensi::where('nik', $user->nik)
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->orderBy('tanggal', 'desc')
            ->get();

        // hitung ringkasan/summary
        $totalHari = $absensi->count();
        $onTime = $absensi->where('status', 'On Time')->count();
        $late = $absensi->where('status', 'Late')->count();
        $sakit = $absensi->where('status', 'Sakit')->count();
        $izin = $absensi->where('status', 'Izin')->count();
        $alpha = $absensi->where('status', 'Alpha')->count();

        return response()->json([
            'summary' => [
                'total_hari' => $totalHari,
                'on_time'    => $onTime,
                'late'       => $late,
                'sakit'      => $sakit,
                'izin'       => $izin,
                'alpha'      => $alpha,
            ],
            'records' => $absensi,
        ]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now('Asia/Jakarta');
        $tanggalHariIni = $now->toDateString();
        $jamSekarang = $now->format('H:i:s');

        // Cek apakah sudah absen hari ini
        $absen = DataAbsensi::where('nik', $user->nik)
            ->whereDate('tanggal', $tanggalHariIni)
            ->whereNotNull('jam_absen') // harus sudah check-in dulu
            ->first();

        if (!$absen) {
            return response()->json([
                'message' => 'Anda belum melakukan absen hari ini.',
            ], 404);
        }

        // Cek apakah sudah checkout sebelumnya
        if ($absen->jam_keluar) {
            return response()->json([
                'message' => 'Anda sudah melakukan checkout hari ini.',
            ], 409);
        }

        // Cek jam — hanya boleh checkout setelah jam 14:00
        if ($now->hour < 14) {
            return response()->json([
                'message' => 'Checkout hanya bisa dilakukan setelah pukul 14:00.',
            ], 403);
        }

        $absen->jam_keluar = $jamSekarang;
        $absen->save();

        return response()->json([
            'message' => 'Checkout berhasil.',
            'data'    => $absen,
        ]);
    }
}