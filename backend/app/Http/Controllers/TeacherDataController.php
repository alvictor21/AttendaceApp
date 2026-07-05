<?php

namespace App\Http\Controllers;

use App\Models\DataGuru;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherDataController extends Controller
{
    // GET /admin/guru — daftar semua guru (data diri)
    public function index(): JsonResponse
    {
        $guru = DataGuru::orderBy('nama_lengkap')->get([
            'id', 'nik', 'nama_lengkap', 'jabatan',
        ]);

        return response()->json([
            'total' => $guru->count(),
            'guru'  => $guru,
        ]);
    }

    // POST /admin/guru — tambah data guru + akun login sekaligus
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nik'          => 'required|string|unique:data_guru,nik',
            'nama_lengkap' => 'required|string|max:255',
            'tgl_lahir'    => 'nullable|date',
            'jabatan'      => 'required|string|max:255',
            'no_hp'        => 'nullable|string|max:20',
            'alamat'       => 'nullable|string',
            'email'        => 'nullable|email|unique:data_guru,email',
            'username'     => 'required|string|unique:data_pengguna,username',
            'password'     => 'required|string|min:6',
            'role'         => 'nullable|string|in:guru,admin',
        ]);

        $guru = null;

        DB::transaction(function () use ($validated, &$guru) {
            $guru = DataGuru::create([
                'nik'          => $validated['nik'],
                'nama_lengkap' => $validated['nama_lengkap'],
                'tgl_lahir'    => $validated['tgl_lahir'] ?? null,
                'jabatan'      => $validated['jabatan'],
                'no_hp'        => $validated['no_hp'] ?? null,
                'alamat'       => $validated['alamat'] ?? null,
                'email'        => $validated['email'] ?? null,
            ]);

            Pengguna::create([
                'nik'       => $validated['nik'],
                'role'      => $validated['role'] ?? 'guru',
                'username'  => $validated['username'],
                'pass'      => Hash::make($validated['password']), // di-bcrypt otomatis
                'nama_user' => $validated['nama_lengkap'],          // diambil dari nama_lengkap
            ]);
        });

        return response()->json([
            'message' => 'Data guru & akun berhasil dibuat.',
            'data'    => $guru,
        ], 201);
    }

    // DELETE /admin/guru/{nik} — hapus data guru
    public function destroy(string $nik): JsonResponse
    {
        $guru = DataGuru::where('nik', $nik)->first();

        if (! $guru) {
            return response()->json(['message' => 'Data guru tidak ditemukan.'], 404);
        }

        $guru->delete();

        return response()->json(['message' => 'Data guru berhasil dihapus.']);
    }

    // GET /admin/guru/{nik} — detail 1 guru + info akun (tanpa password asli)
    public function show(string $nik): JsonResponse
    {
        $guru = DataGuru::where('nik', $nik)->first();

        if (! $guru) {
            return response()->json(['message' => 'Data guru tidak ditemukan.'], 404);
        }

        $akun = Pengguna::where('nik', $nik)->first(['username', 'role']);

        return response()->json([
            'guru' => $guru,
            'akun' => $akun,
        ]);
    }

    // PUT /admin/guru/{nik} — update data guru + akun (password opsional)
    public function update(Request $request, string $nik): JsonResponse
    {
        $guru = DataGuru::where('nik', $nik)->first();
        if (! $guru) {
            return response()->json(['message' => 'Data guru tidak ditemukan.'], 404);
        }

        $akunLama = Pengguna::where('nik', $nik)->first();

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'jabatan'      => 'required|string|max:255',
            'no_hp'        => 'nullable|string|max:20',
            'alamat'       => 'nullable|string',
            'email'        => 'nullable|email|unique:data_guru,email,' . $guru->id,
            'username'     => 'required|string|unique:data_pengguna,username,' . $nik . ',nik',
            // password wajib kalau akunnya belum ada sama sekali, opsional kalau cuma update akun yg udah ada
            'password'     => $akunLama ? 'nullable|string|min:6' : 'required|string|min:6',
        ]);

        DB::transaction(function () use ($validated, $guru, $nik, $akunLama) {
            $guru->update([
                'nama_lengkap' => $validated['nama_lengkap'],
                'jabatan'      => $validated['jabatan'],
                'no_hp'        => $validated['no_hp'] ?? null,
                'alamat'       => $validated['alamat'] ?? null,
                'email'        => $validated['email'] ?? null,
            ]);

            if ($akunLama) {
                $akunData = ['username' => $validated['username']];
                if (! empty($validated['password'])) {
                    $akunData['pass'] = Hash::make($validated['password']);
                }
                $akunLama->update($akunData);
            } else {
                // guru ini belum punya akun → bikinin baru
                Pengguna::create([
                    'nik'       => $nik,
                    'role'      => 'guru',
                    'username'  => $validated['username'],
                    'pass'      => Hash::make($validated['password']),
                    'nama_user' => $validated['nama_lengkap'],
                ]);
            }
        });

        return response()->json(['message' => 'Data guru berhasil diperbarui.']);
    }
}