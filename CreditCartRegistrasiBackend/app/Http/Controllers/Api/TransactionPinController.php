<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TransactionPinController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'has_pin' => (bool) $user->transaction_pin_hash,
            'updated_at' => $user->transaction_pin_updated_at,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pin' => ['required', 'digits:6'],
            'confirm_pin' => ['required', 'digits:6', 'same:pin'],
        ]);

        $request->user()->forceFill([
            'transaction_pin_hash' => Hash::make($data['pin']),
            'transaction_pin_updated_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'PIN transaksi berhasil disimpan.',
            'has_pin' => true,
            'updated_at' => $request->user()->fresh()->transaction_pin_updated_at,
        ]);
    }
}
