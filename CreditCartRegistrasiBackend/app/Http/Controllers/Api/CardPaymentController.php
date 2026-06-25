<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CardPayment;
use App\Models\CreditCardProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CardPaymentController extends Controller
{
    public function initialDeposit(Request $request)
    {
        $user = $request->user();
        $profile = $user->creditCardProfile;

        abort_unless($profile, 404, 'Profil pengajuan belum ditemukan.');

        if ($profile->application_status !== 'approved') {
            return response()->json(['message' => 'Pengajuan belum disetujui admin.'], 422);
        }

        if ($profile->credit_limit_unlocked_at) {
            return response()->json(['message' => 'Limit kartu sudah aktif.'], 422);
        }

        $amount = (float) ($profile->initial_deposit_amount ?? 0);

        if ($amount <= 0) {
            $this->unlockLimit($profile);

            return response()->json([
                'message' => 'Limit kartu berhasil diaktifkan.',
                'profile' => $profile->fresh(),
            ]);
        }

        $payment = CardPayment::create([
            'user_id' => $user->id,
            'credit_card_profile_id' => $profile->id,
            'order_id' => 'NEXA-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(6)),
            'type' => 'initial_deposit',
            'amount' => $amount,
            'status' => 'pending',
        ]);

        $serverKey = config('services.midtrans.server_key');

        if (! $serverKey) {
            return response()->json([
                'message' => 'Pembayaran mode development dibuat. Isi MIDTRANS_SERVER_KEY untuk mengaktifkan Snap.',
                'payment' => $payment,
                'snap_token' => null,
                'redirect_url' => null,
            ], 201);
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $payment->order_id,
                'gross_amount' => (int) $amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'item_details' => [[
                'id' => 'initial-deposit',
                'price' => (int) $amount,
                'quantity' => 1,
                'name' => 'Saldo awal aktivasi kartu Nexa Prime',
            ]],
        ];

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->timeout(20)
            ->post(config('services.midtrans.snap_url'), $payload);

        if ($response->failed()) {
            $payment->update(['status' => 'failed', 'payload' => $response->json()]);

            return response()->json([
                'message' => 'Gagal membuat transaksi Midtrans.',
                'detail' => $response->json(),
            ], 502);
        }

        $payment->update([
            'midtrans_token' => $response->json('token'),
            'midtrans_redirect_url' => $response->json('redirect_url'),
            'payload' => $response->json(),
        ]);

        return response()->json([
            'message' => 'Transaksi saldo awal berhasil dibuat.',
            'payment' => $payment->fresh(),
            'snap_token' => $response->json('token'),
            'redirect_url' => $response->json('redirect_url'),
        ], 201);
    }

    public function callback(Request $request)
    {
        $orderId = $request->input('order_id');
        $payment = CardPayment::where('order_id', $orderId)->firstOrFail();
        $status = $request->input('transaction_status');
        $fraudStatus = $request->input('fraud_status');

        if (in_array($status, ['capture', 'settlement'], true) && $fraudStatus !== 'deny') {
            $payment->update([
                'status' => 'paid',
                'midtrans_transaction_id' => $request->input('transaction_id'),
                'payload' => $request->all(),
                'paid_at' => now(),
            ]);

            $this->unlockLimit($payment->profile);
        } elseif (in_array($status, ['cancel', 'deny', 'expire'], true)) {
            $payment->update([
                'status' => $status,
                'payload' => $request->all(),
            ]);
        } else {
            $payment->update(['payload' => $request->all()]);
        }

        return response()->json(['message' => 'Callback diterima.']);
    }

    private function unlockLimit(CreditCardProfile $profile): void
    {
        $profile->forceFill([
            'available_limit' => $profile->credit_limit,
            'initial_deposit_status' => 'paid',
            'credit_limit_unlocked_at' => now(),
        ])->save();
    }
}
