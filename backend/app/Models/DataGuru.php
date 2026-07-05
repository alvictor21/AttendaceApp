<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataGuru extends Model
{
    protected $table = 'data_guru';

    protected $fillable = [
        'nik',
        'nama_lengkap',
        'tgl_lahir',
        'jabatan',
        'no_hp',
        'alamat',
        'email'
    ];
}