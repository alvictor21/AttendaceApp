<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherData extends Model
{
    protected $table = 'data_guru'; // ganti sesuai nama tabel guru kamu yang asli

    protected $fillable = [
        'nik',
        'nama_lengkap',
        'jabatan',
    ];

    public $timestamps = false; // ganti ke true kalau tabel ini punya created_at / updated_at
}