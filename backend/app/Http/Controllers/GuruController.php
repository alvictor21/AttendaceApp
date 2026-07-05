<?php

namespace App\Http\Controllers;

use App\Models\DataGuru;

use Illuminate\Http\Request;

class GuruController extends Controller
{
    public function index()
    {
        $guru = DataGuru::all();

        return response()->json([
            'success' => true,
            'data' => $guru
        ]);
    }

    public function totalGuru()
    {
        $total = DataGuru::count();

        return response()->json([
            'success' => true,
            'total_guru' => $total
        ]);
    }
}