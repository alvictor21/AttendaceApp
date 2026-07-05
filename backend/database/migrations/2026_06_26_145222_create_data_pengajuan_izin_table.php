<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('data_pengajuan_izin', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 20)->collation('utf8mb4_0900_ai_ci');
            $table->date('tanggal');
            $table->enum('jenis', ['Izin', 'Sakit']);
            $table->enum('status_pengajuan', ['Menunggu', 'Disetujui', 'Ditolak'])->default('Menunggu');
            $table->text('keterangan')->nullable();
            $table->string('dokumen_pendukung')->nullable();
            $table->timestamps();

            $table->foreign('nik')->references('nik')->on('data_pengguna')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::dropIfExists('data_pengajuan_izin');
}
};
