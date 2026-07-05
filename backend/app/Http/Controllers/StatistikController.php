<?php

namespace App\Http\Controllers;

use App\Models\DataStatistik;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class StatistikController extends Controller
{
    public function statistikHariIni(): JsonResponse
    {
        $tanggalAktif = $this->getTanggalAktif();

        $absenHariIni = DataStatistik::whereDate('tanggal', $tanggalAktif)->get();

        // ===== Sesuaikan mapping status di sini kalau perlu =====
        $presentToday = $absenHariIni->whereIn('status', ['On Time'])->count();
        $lateToday    = $absenHariIni->whereIn('status', ['Late'])->count();
        $notPresent   = $absenHariIni->whereIn('status', ['Alpha'])->count();
        $sickLeave    = $absenHariIni->whereIn('status', ['Sakit'])->count();
        // =========================================================

         return response()->json([
        'tanggal'  => $tanggalAktif,
        'on_time'  => $absenHariIni->where('status', 'On Time')->count(),
        'late'     => $absenHariIni->where('status', 'Late')->count(),
        'alpha'    => $absenHariIni->where('status', 'Alpha')->count(),
        'sakit'    => $absenHariIni->where('status', 'Sakit')->count(),
        'izin'     => $absenHariIni->where('status', 'Izin')->count(),
    ]);
    }

    /**
     * "Hari ini" versi app absen ini reset jam 3 pagi, bukan jam 00:00.
     * Jadi kalau sekarang masih sebelum jam 3 pagi, dianggap masih tanggal kemarin.
     */
    private function getTanggalAktif(): string
    {
        $now = Carbon::now('Asia/Jakarta');
        $jamReset = 3;

        if ($now->hour < $jamReset) {
            return $now->copy()->subDay()->toDateString();
        }

        return $now->toDateString();
    }
}