<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/xxxx_xx_xx_create_data_absensi_table.php
    // database/migrations/xxxx_xx_xx_create_data_absen_table.php
public function up()
{
    Schema::create('data_absen', function (Blueprint $table) {
        $table->id();
        $table->string('nik', 20)->collation('utf8mb4_0900_ai_ci');
        $table->date('tanggal');
        $table->time('jam_absen')->nullable();
        $table->enum('status', ['On Time', 'Late', 'Sakit', 'Izin', 'Alpha']);
        $table->timestamps();

        $table->foreign('nik')->references('nik')->on('data_pengguna')->onDelete('cascade');
        $table->unique(['nik', 'tanggal']);
    });
}

public function down()
{
    Schema::dropIfExists('data_absen');
}
    
};
