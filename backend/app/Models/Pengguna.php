<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Nama tabel eksplisit, karena Laravel defaultnya nebak "data_penggunas"
    public $timestamps = false;
    protected $table = 'data_pengguna';

    // Kolom yang boleh diisi massal
    protected $fillable = [
        'nik',
        'role',
        'username',
        'pass',
        'nama_user',
    ];

    // Sembunyikan kolom ini saat response JSON
    protected $hidden = [
        'pass',
    ];

    // Kasih tahu Laravel: kolom password-nya namanya "pass", bukan "password"

     public function dataGuru()
    {
        return $this->hasOne(DataGuru::class, 'nik', 'nik');
        // hasOne(RelatedModel, foreign_key_di_related, local_key_di_model_ini)
    
    }
    public function getAuthPassword()
    {
        return $this->pass;
    }
}