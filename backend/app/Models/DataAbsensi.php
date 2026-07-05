<?php

// app/Models/DataAbsensi.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataAbsensi extends Model
{
    protected $table = 'data_absen';

    protected $fillable = [
        'nik',
        'tanggal',
        'jam_absen',
        'jam_keluar',
        'status',
        'foto'
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'nik', 'nik');
    }
}