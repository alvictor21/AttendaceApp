<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class HapusFileAbsen extends Command
{
    protected $signature   = 'absen:hapus-file';
    protected $description = 'Hapus semua file foto absen dan dokumen izin setiap awal bulan';

    public function handle()
    {
        $folders = ['foto-absen', 'dokumen-izin'];
        $totalHapus = 0;

        foreach ($folders as $folder) {
            $files = Storage::disk('public')->files($folder);

            foreach ($files as $file) {
                Storage::disk('public')->delete($file);
                $totalHapus++;
            }

            Log::info("Folder {$folder} dibersihkan", ['jumlah_file' => count($files)]);
        }

        Log::info('Selesai hapus file absen', ['total' => $totalHapus]);
        $this->info("Selesai. Total {$totalHapus} file dihapus.");
    }
}
