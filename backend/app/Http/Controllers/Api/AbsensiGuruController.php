<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataAbsensi;
use App\Models\DataGuruAbsen;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsensiGuruController extends Controller
{
    // ------------------------------------------------------------------
    // GET /api/absensi/today
    //
    // Mengembalikan semua guru beserta status absensi hari ini.
    // Guru yang BELUM absen tetap muncul dengan status "Absent".
    // Response juga menyertakan `reset_at` (kapan sesi berikutnya mulai)
    // supaya frontend bisa countdown / auto-refresh.
    // ------------------------------------------------------------------
    public function today(Request $request): JsonResponse
    {
        $attendanceDate = DataAbsensi::currentAttendanceDate();

        // 1. Ambil semua record absensi hari ini (dengan data guru via join)
        $records = DataAbsensi::with('guru')
            ->today()
            ->get()
            ->keyBy('nik');          // index by NIK untuk lookup cepat

        // 2. Ambil semua guru (bisa di-filter kalau perlu)
        $allGuru = DataGuruAbsen::all();

        // 3. Mapping: gabungkan data guru + absensi (atau default "Absent")
        $result = $allGuru->map(function (DataGuruAbsen $guru) use ($records) {
            $absen = $records->get($guru->nik);

            return [
                'nik'          => $guru->nik,
                'nama_lengkap' => $guru->nama_lengkap,
                'jabatan'      => $guru->jabatan,
                'status'       => $absen ? $this->mapStatus($absen->status) : 'Absent',
                'jam_absen'    => $absen?->jam_absen
                    ? Carbon::parse($absen->jam_absen)->format('h:i A')
                    : null,
                'tanggal'      => $absen?->tanggal?->toDateString(),
            ];
        });

        // 4. Hitung waktu reset berikutnya (jam 03:00 besok / hari ini)
        $now      = Carbon::now();
        $resetAt  = $now->copy()->setTime(3, 0, 0);
        if ($now->gte($resetAt)) {
            $resetAt->addDay();
        }

        return response()->json([
            'date'            => $attendanceDate->toDateString(),
            'reset_at'        => $resetAt->toIso8601String(),   // ← dipakai frontend
            'reset_at_unix'   => $resetAt->timestamp,
            'teachers'        => $result->values(),
        ]);
    }

    // ------------------------------------------------------------------
    // Mapping: status di DB  →  label yang dipakai frontend
    // DB enum: 'On Time' | 'Late' | 'Sakit' | 'Izin' | 'Alpha'
    // ------------------------------------------------------------------
    private function mapStatus(string $dbStatus): string
    {
        return match ($dbStatus) {
            'On Time' => 'Present',
            'Late'    => 'Late',
            'Sakit'   => 'Sick',
            'Izin'    => 'Leave',
            'Alpha'   => 'Absent',
            default   => 'Absent',
        };
    }
}