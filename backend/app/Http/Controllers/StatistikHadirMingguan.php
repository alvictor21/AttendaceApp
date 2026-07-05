<?php

namespace App\Http\Controllers;

use App\Models\DataAbsensi; // sesuaikan jika nama model kamu berbeda
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class StatistikHadirMingguan extends Controller
{
    /**
     * Urutan hari index 0-6, Senin sebagai awal minggu.
     */
    private array $namaHari = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /**
     * GET /api/statistik/hadir-mingguan
     *
     * Mengembalikan jumlah kehadiran per hari untuk minggu berjalan
     * (Senin - Minggu). Tidak perlu job/cron untuk "reset" mingguan —
     * rentang tanggal selalu dihitung ulang dari Carbon::now(), jadi
     * begitu masuk Senin baru, rentang tanggalnya otomatis bergeser
     * dan semua hari baru mulai dari 0 (karena belum ada data hadir
     * di tanggal-tanggal tersebut).
     */
    public function index(): JsonResponse
    {
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endOfWeek   = Carbon::now()->endOfWeek(Carbon::SUNDAY);

        // Ambil total hadir per tanggal dalam satu query saja (efisien)
        $hadirPerTanggal = DataAbsensi::query()
            ->whereBetween('tanggal', [$startOfWeek->toDateString(), $endOfWeek->toDateString()])
            ->where('status', 'On Time')
            ->selectRaw('tanggal, COUNT(*) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal'); // hasil: ['2026-06-22' => 12, ...]

        $data = [];

        for ($i = 0; $i < 7; $i++) {
            $tanggal       = $startOfWeek->copy()->addDays($i);
            $tanggalString = $tanggal->toDateString();

            $data[] = [
                'hari'         => $this->namaHari[$i],
                'tanggal'      => $tanggalString,
                'jumlah_hadir' => (int) ($hadirPerTanggal[$tanggalString] ?? 0),
                'is_today'     => $tanggal->isToday(),
                'is_future'    => $tanggal->isFuture(),
            ];
        }

        return response()->json([
            'minggu_mulai'   => $startOfWeek->toDateString(),
            'minggu_selesai' => $endOfWeek->toDateString(),
            'data'           => $data,
        ]);
    }
}