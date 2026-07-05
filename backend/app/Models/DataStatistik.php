<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataStatistik extends Model
{
    protected $table = 'data_absen';

    protected $fillable = [
        'nik',
        'tanggal',
        'jam_absen',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
