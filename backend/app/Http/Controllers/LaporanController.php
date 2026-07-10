<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\DataAbsensi;
use App\Models\DataGuru;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->query('bulan', Carbon::now('Asia/Jakarta')->format('m'));
        $tahun = $request->query('tahun', Carbon::now('Asia/Jakarta')->format('Y'));
        $tanggal = $request->query('tanggal'); // opsional, untuk filter harian
        $status = $request->query('status');   // opsional, untuk filter status

        // ── Summary 5 card bulan ini ──────────────────────────────
        $semuaAbsenBulanIni = DataAbsensi::whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->get();

        $summary = [
            'on_time'       => $semuaAbsenBulanIni->where('status', 'On Time')->count(),
            'late'          => $semuaAbsenBulanIni->where('status', 'Late')->count(),
            'sakit'         => $semuaAbsenBulanIni->where('status', 'Sakit')->count(),
            'izin'          => $semuaAbsenBulanIni->where('status', 'Izin')->count(),
            'alpha'         => $semuaAbsenBulanIni->where('status', 'Alpha')->count(),
        ];

        // ── Records dengan filter tanggal & status ────────────────
        $query = DataAbsensi::with('pengguna') // relasi ke data_pengguna untuk nama
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan);

        if ($tanggal) {
            $query->whereDay('tanggal', $tanggal);
        }

        if ($status && $status !== 'All') {
            $query->where('status', $status);
        }

        $records = $query->orderBy('tanggal', 'desc')
            ->orderBy('jam_absen', 'asc')
            ->get()
            ->map(function ($absen) {
                // Ambil nama dari data_guru berdasarkan nik
                $guru = DataGuru::where('nik', $absen->nik)->first();
                return [
                    'nik'        => $absen->nik,
                    'nama'       => $guru->nama_lengkap ?? $absen->pengguna->nama_user ?? '-',
                    'jabatan'    => $guru->jabatan ?? '-',
                    'tanggal'    => $absen->tanggal,
                    'jam_absen'  => $absen->jam_absen,
                    'jam_keluar'  => $absen->jam_keluar,
                    'status'     => $absen->status,
                ];
            });

        return response()->json([
            'bulan'   => (int) $bulan,
            'tahun'   => (int) $tahun,
            'summary' => $summary,
            'records' => $records,
        ]);
    }

  public function exportXLSX(Request $request)
{
    $bulan = $request->query('bulan', Carbon::now('Asia/Jakarta')->format('m'));
    $tahun = $request->query('tahun', Carbon::now('Asia/Jakarta')->format('Y'));

    $semuaGuru     = DataGuru::orderBy('nama_lengkap')->get();
    $semuaPengguna = \App\Models\Pengguna::all()->keyBy('nik');
    $daysInMonth   = Carbon::createFromDate($tahun, $bulan, 1)->daysInMonth;

    $semuaAbsen = DataAbsensi::whereYear('tanggal', $tahun)
        ->whereMonth('tanggal', $bulan)
        ->get()
        ->keyBy(fn($a) => $a->nik . '_' . $a->tanggal);

    $statusColor = [
        'On Time'        => 'FF22C55E',
        'Late'           => 'FFF97316',
        'Sakit'          => 'FF3B82F6',
        'Izin'           => 'FF3B82F6',
        'Alpha'          => 'FFEF4444',
        'Pengajuan Izin' => 'FFFB923C',
        'Absent'         => 'FF94A3B8',
    ];

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Rekap Absensi');

    // ── Header ──
    // Tambah kolom "Jam Keluar Absen" di posisi ke-7
    $headers = ['No', 'Tanggal', 'Nama Guru', 'Akun Guru', 'Status Absen', 'Jam Masuk Absen', 'Jam Keluar Absen'];
    foreach ($headers as $col => $header) {
        $cell = $sheet->getCell([$col + 1, 1]);
        $cell->setValue($header);
        $cell->getStyle()->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Calibri', 'color' => ['rgb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FF1E293B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
    }

    // ── Data ──
    $row = 2;
    $no  = 1;

    for ($day = 1; $day <= $daysInMonth; $day++) {
        $tanggal          = sprintf('%s-%02d-%02d', $tahun, $bulan, $day);
        $tanggalFormatted = sprintf('%02d/%02d/%s', $day, $bulan, $tahun);

        $startRow = $row;

        foreach ($semuaGuru as $guru) {
            $key   = $guru->nik . '_' . $tanggal;
            $absen = $semuaAbsen->get($key);

            $status      = $absen ? $absen->status : 'Absent';
            $jamAbsen    = ($absen && $absen->jam_absen)  ? substr($absen->jam_absen, 0, 5)  : 'No Record';
            $jamKeluar   = ($absen && $absen->jam_keluar) ? substr($absen->jam_keluar, 0, 5) : 'No Record';
            $bgColor     = $statusColor[$status] ?? 'FFCBD5E1';

            $rowData = [
                1 => $no++,
                3 => $guru->nama_lengkap,
                4 => $semuaPengguna->get($guru->nik)?->username ?? '-',
                5 => $status,
                6 => $jamAbsen,
                7 => $jamKeluar,
            ];

            foreach ($rowData as $colIndex => $value) {
                $cell = $sheet->getCell([$colIndex, $row]);
                $cell->setValue($value);

                $isStatusCol = ($colIndex === 5);
                $cell->getStyle()->applyFromArray([
                    'font'      => [
                        'name'  => 'Calibri',
                        'size'  => 10,
                        'color' => ['rgb' => $isStatusCol ? 'FFFFFFFF' : 'FF1E293B'],
                        'bold'  => $isStatusCol,
                    ],
                    'fill'      => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $isStatusCol ? $bgColor : ($row % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF')],
                    ],
                    'alignment' => [
                        'horizontal' => in_array($colIndex, [1, 5, 6, 7])
                            ? Alignment::HORIZONTAL_CENTER
                            : Alignment::HORIZONTAL_LEFT,
                        'vertical'   => Alignment::VERTICAL_CENTER,
                    ],
                    'borders'   => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFE2E8F0']],
                    ],
                ]);
            }

            $sheet->getRowDimension($row)->setRowHeight(20);
            $row++;
        }

        $endRow = $row - 1;

        $sheet->mergeCells("B{$startRow}:B{$endRow}");
        $dateCell = $sheet->getCell([2, $startRow]);
        $dateCell->setValue($tanggalFormatted);
        $dateCell->getStyle()->applyFromArray([
            'font'      => ['bold' => true, 'size' => 11, 'name' => 'Calibri', 'color' => ['rgb' => 'FF1E293B']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFEFF6FF']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
            'borders'   => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFE2E8F0']],
            ],
        ]);

        // ── Baris kosong (gap) sebagai pemisah antar tanggal ──
        $sheet->getRowDimension($row)->setRowHeight(22); // baris tipis, cukup buat spasi
        $row++;
    }

    // ── Lebar kolom ──
    $sheet->getColumnDimension('A')->setWidth(6);   // No
    $sheet->getColumnDimension('B')->setWidth(14);  // Tanggal
    $sheet->getColumnDimension('C')->setWidth(28);  // Nama Guru
    $sheet->getColumnDimension('D')->setWidth(24);  // Akun Guru
    $sheet->getColumnDimension('E')->setWidth(16);  // Status
    $sheet->getColumnDimension('F')->setWidth(16);  // Jam Masuk
    $sheet->getColumnDimension('G')->setWidth(16);  // Jam Keluar

    $sheet->freezePane('A2');

    $namaFile = 'laporan-absen-' . $bulan . '-' . $tahun . '.xlsx';

    ob_start();
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    $content = ob_get_clean();

    return response($content, 200, [
        'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="' . $namaFile . '"',
        'Cache-Control'       => 'max-age=0',
    ]);
}
}