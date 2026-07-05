<?php
// app/Models/DataPengajuanIzin.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataPengajuanIzin extends Model
{
    protected $table = 'data_pengajuan_izin';

    protected $fillable = [
        'nik',
        'tanggal',
        'tanggal_selesai', 
        'jenis',
        'keterangan',
        'dokumen_pendukung',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'nik', 'nik');
    }
}