<?php

namespace App\Http\Controllers;

use App\Models\DataGuru;
use App\Models\DataAbsensi;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AbsensiDetailController extends Controller
{
    // Mapping status DB (enum) -> status yang dipakai frontend
    private const STATUS_MAP = [
        'On Time' => 'Present',
        'Late'    => 'Late',
        'Sakit'   => 'Sick',
        'Izin'    => 'Leave',
        'Pengajuan Izin'  => 'PengajuanIzin',
        'Alpha'   => 'Absent',
    ];

    public function today(): JsonResponse
    {
        [$tanggalAktif, $nextReset] = $this->getSesiAbsenAktif();

        // Ambil semua record absen utk tanggal aktif, key by nik
        // (asumsi 1 guru cuma 1 record per hari, kalau bisa lebih dari 1 kasih tau)
        $absenHariIni = DataAbsensi::whereDate('tanggal', $tanggalAktif)
            ->get()
            ->keyBy('nik');

        $teachers = DataGuru::all()->map(function ($guru) use ($absenHariIni) {
            $absen = $absenHariIni->get($guru->nik);

            return [
                'nik'          => $guru->nik,
                'nama_lengkap' => $guru->nama_lengkap,
                'jabatan'      => $guru->jabatan,
                'status'       => $absen
                    ? (self::STATUS_MAP[$absen->status] ?? 'Absent')
                    : 'Absent',
                'jam_absen'    => $absen->jam_absen ?? null,
                'tanggal' => $absen->tanggal ?? null,
            ];
        });

        return response()->json([
            'date'          => $tanggalAktif,
            'reset_at'      => $nextReset->toIso8601String(),
            'reset_at_unix' => $nextReset->timestamp,
            'teachers'      => $teachers,
        ]);
    }

    /**
     * Tentukan tanggal sesi absen aktif (reset jam 3 pagi)
     * + jam berapa reset berikutnya bakal terjadi (buat countdown di frontend).
     */
    private function getSesiAbsenAktif(): array
    {
        $now = Carbon::now('Asia/Jakarta');
        $jamReset = 3;

        if ($now->hour < $jamReset) {
            $tanggalAktif = $now->copy()->subDay()->toDateString();
            $nextReset = $now->copy()->setTime($jamReset, 0, 0);
        } else {
            $tanggalAktif = $now->toDateString();
            $nextReset = $now->copy()->addDay()->setTime($jamReset, 0, 0);
        }

        return [$tanggalAktif, $nextReset];
    }

        public function statistikBulanan(Request $request, string $nik): JsonResponse
    {
        $bulan = $request->query('bulan', Carbon::now('Asia/Jakarta')->format('m'));
        $tahun = $request->query('tahun', Carbon::now('Asia/Jakarta')->format('Y'));

        $absensi = DataAbsensi::where('nik', $nik)
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->get();

        return response()->json([
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'summary' => [
                'on_time' => $absensi->where('status', 'On Time')->count(),
                'late'    => $absensi->where('status', 'Late')->count(),
                'izin'    => $absensi->where('status', 'Izin')->count(),
                'sakit'   => $absensi->where('status', 'Sakit')->count(),
                'alpha'   => $absensi->where('status', 'Alpha')->count(),
            ],
        ]);
    }
}