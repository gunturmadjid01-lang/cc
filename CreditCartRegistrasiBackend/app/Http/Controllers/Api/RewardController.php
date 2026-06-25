<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class RewardController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'points' => 0,
            'expires_notice' => 'Poin akan hangus selepas 1 tahun jika tidak digunakan.',
            'rewards' => [
                [
                    'id' => 'cashback',
                    'title' => 'Cashback',
                    'description' => 'Tukar poin menjadi saldo kartu dan gunakan untuk transaksi berikutnya.',
                    'minimum_points' => 2500,
                ],
                [
                    'id' => 'vouchers',
                    'title' => 'Voucher Belanja',
                    'description' => 'Nikmati potongan di merchant pilihan untuk belanja harian dan lifestyle.',
                    'minimum_points' => 1500,
                ],
                [
                    'id' => 'pulsa-data',
                    'title' => 'Pulsa & Paket Data',
                    'description' => 'Tukar poin untuk isi ulang pulsa atau kuota internet, langsung masuk.',
                    'minimum_points' => 1000,
                ],
                [
                    'id' => 'electricity',
                    'title' => 'Tagihan Listrik',
                    'description' => 'Gunakan poin untuk bantu bayar tagihan listrik bulanan secara instan.',
                    'minimum_points' => 3000,
                ],
            ],
        ]);
    }
}
