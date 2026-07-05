<?php

// app/Http/Controllers/Api/PengajuanIzinController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataAbsensi;
use App\Models\DataPengajuanIzin;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PengajuanIzinController extends Controller
{
    // Cek apakah hari ini sudah ada pengajuan
    public function today(Request $request)
    {
        $user = $request->user();
        $tanggal = Carbon::now()->format('Y-m-d');

        $absen = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggal)
            ->where('status', 'Pengajuan Izin')
            ->first();

        return response()->json([
            'ada_pengajuan' => $absen !== null,
            'data'          => $absen,
        ]);
    }

    // Buat pengajuan baru
    public function store(Request $request)
    {
        $user = $request->user();
        $tanggal = Carbon::now()->format('Y-m-d');

        // Cek sudah absen biasa hari ini
        $sudahAbsen = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggal)
            ->whereIn('status', ['On Time', 'Late', 'Alpha'])
            ->exists();

        if ($sudahAbsen) {
            return response()->json([
                'message' => 'Anda sudah melakukan absen hari ini.',
            ], 409);
        }

        // Cek duplikat pengajuan izin hari ini
        $sudahAda = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggal)
            ->where('status', 'Pengajuan Izin')
            ->exists();

        if ($sudahAda) {
            return response()->json([
                'message' => 'Anda sudah mengajukan izin hari ini.',
            ], 409);
        }

        // Insert ke data_absen dengan status Pengajuan Izin
        $absen = DataAbsensi::create([
            'nik'      => $user->nik,
            'tanggal'  => $tanggal,
            'jam_absen' => null,
            'status'   => 'Pengajuan Izin',
            'foto'     => null,
        ]);

        return response()->json([
            'message' => 'Pengajuan izin berhasil dikirim.',
            'data'    => $absen,
        ], 201);
    }

    // Batalkan pengajuan (hanya kalau masih Menunggu)
    public function cancel(Request $request)
    {
        $user = $request->user();
        $tanggal = Carbon::now()->format('Y-m-d');

        $absen = DataAbsensi::where('nik', $user->nik)
            ->where('tanggal', $tanggal)
            ->where('status', 'Pengajuan Izin')
            ->first();

        if (!$absen) {
            return response()->json([
                'message' => 'Pengajuan izin tidak ditemukan.',
            ], 404);
        }

        $absen->delete();

        return response()->json([
            'message' => 'Pengajuan izin berhasil dibatalkan.',
        ]);
    }
}