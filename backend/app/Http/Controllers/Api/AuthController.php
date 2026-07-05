<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * LOGIN
     */
    public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // load relasi dataGuru sekaligus
    $user = Pengguna::with('dataGuru')->where('username', $request->username)->first();

    if (! $user || ! Hash::check($request->password, $user->pass)) {
        return response()->json([
            'message' => 'Username atau password salah.',
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message'      => 'Login berhasil.',
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user' => [
            'id'        => $user->id,
            'nama_user' => $user->nama_user,
            'username'  => $user->username,
            'role'      => $user->role,
            'nik'       => $user->nik,
            'jabatan'   => $user->dataGuru->jabatan ?? null, // sesuaikan nama kolom
            'email'     => $user->email ?? $user->dataGuru->email ?? null, // sesuaikan: ambil dari tabel pengguna atau data_guru
            'no_hp'     => $user->no_hp ?? $user->dataGuru->no_hp ?? null, // sesuaikan: ambil dari tabel pengguna atau data_guru
        ],
    ]);
}

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * CEK USER YANG SEDANG LOGIN
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}