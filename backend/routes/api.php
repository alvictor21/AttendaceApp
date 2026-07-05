<?php

use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DetailIzin;
use App\Http\Controllers\Api\PengajuanIzinController;
use App\Http\Controllers\AbsensiDetailController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\StatistikController;
use App\Http\Controllers\StatistikHadirMingguan;
use App\Http\Controllers\TeacherDataController;
use App\Http\Controllers\LaporanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admin/dashboard', [AuthController::class, 'me']);
    Route::get('/user/dashboard', fn (Request $request) => $request->user());
});

/*
|--------------------------------------------------------------------------
| Absensi (guru)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/absensi/check-in', [AbsensiController::class, 'checkIn']);
    Route::get('/absensi/today', [AbsensiController::class, 'today']);
    Route::get('/absensi/history', [AbsensiController::class, 'history']);
    Route::post('/absensi/check-out', [AbsensiController::class, 'checkOut']);
});

Route::get('/absensi/detail', [AbsensiDetailController::class, 'today']);

/*
|--------------------------------------------------------------------------
| Pengajuan Izin (guru)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/izin/today', [PengajuanIzinController::class, 'today']);
    Route::post('/izin/store', [PengajuanIzinController::class, 'store']);
    Route::delete('/izin/cancel', [PengajuanIzinController::class, 'cancel']);
    Route::post('/izin/submit-detail', [DetailIzin::class, 'submitDetail']);
});
/*
|--------------------------------------------------------------------------
| Laporans
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/export-csv', [LaporanController::class, 'exportCSV']);
    Route::get('/laporan/export-xlsx', [LaporanController::class, 'exportXLSX']);
});
/*
|--------------------------------------------------------------------------
| Pengajuan Izin (admin — review & keputusan)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/izin/detail/{nik}', [DetailIzin::class, 'detailByNik']);
    Route::post('/izin/approve/{nik}', [DetailIzin::class, 'approve']);
    Route::post('/izin/reject/{nik}', [DetailIzin::class, 'reject']);
});

/*
|--------------------------------------------------------------------------
| Statistik
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/statistik/hadir-mingguan', [StatistikHadirMingguan::class, 'index']);
});

Route::get('/statistik-hari-ini', [StatistikController::class, 'statistikHariIni']);

/*
|--------------------------------------------------------------------------
| Data Guru
|--------------------------------------------------------------------------
*/
Route::get('/guru', [GuruController::class, 'index']);
Route::get('/total-guru', [GuruController::class, 'totalGuru']);

Route::get('/admin/guru', [TeacherDataController::class, 'index']);
Route::post('/admin/guru', [TeacherDataController::class, 'store']);
Route::get('/admin/guru/{nik}', [TeacherDataController::class, 'show']);
Route::put('/admin/guru/{nik}', [TeacherDataController::class, 'update']);
Route::delete('/admin/guru/{nik}', [TeacherDataController::class, 'destroy']);
Route::get('/admin/guru/{nik}/statistik-bulanan', [AbsensiDetailController::class, 'statistikBulanan']);