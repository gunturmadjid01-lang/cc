<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $user = $request->user();
        $profile = $user->creditCardProfile;

        abort_unless($profile, 404, 'Profil pengajuan belum ditemukan.');

        $uploadedRequiredDocuments = $user->verificationDocuments()
            ->whereIn('type', ['ktp', 'npwp', 'selfie'])
            ->count();

        if ($uploadedRequiredDocuments < 3) {
            return response()->json([
                'message' => 'Lengkapi dokumen wajib: KTP, NPWP, dan foto selfie sebelum meminta OTP.',
            ], 422);
        }

        $otp = (string) random_int(100000, 999999);
        $profile->forceFill([
            'application_status' => 'otp_pending',
            'otp_code_hash' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(5),
        ])->save();

        $token = config('services.fonnte.token');

        if ($token) {
            $target = $this->normalizePhoneTarget($user->phone);

            $response = Http::asForm()
                ->withHeaders(['Authorization' => $token])
                ->timeout(15)
                ->post('https://api.fonnte.com/send', [
                    'message' => "Kode OTP pengajuan kartu kredit Nexa Anda: {$otp}. Berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.",
                    'target' => $target,
                    'typing' => false,
                ]);

            if ($response->failed() || $response->json('status') === false) {
                return response()->json([
                    'message' => 'OTP gagal dikirim. Periksa konfigurasi Fonnte atau coba lagi.',
                    'detail' => $response->json('reason') ?? $response->json('detail'),
                ], 502);
            }
        }

        return response()->json([
            'message' => $token ? 'OTP berhasil dikirim.' : 'OTP mode development dibuat. Atur FONNTE_TOKEN untuk mengirim WhatsApp.',
            'dev_otp' => app()->isLocal() && ! $token ? $otp : null,
            'expires_at' => $profile->otp_expires_at,
        ]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $profile = $request->user()->creditCardProfile;

        abort_unless($profile, 404, 'Profil pengajuan belum ditemukan.');

        if (! $profile->otp_code_hash || ! $profile->otp_expires_at || now()->greaterThan($profile->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP sudah kedaluwarsa. Kirim ulang OTP.'], 422);
        }

        if (! Hash::check($data['otp'], $profile->otp_code_hash)) {
            return response()->json(['message' => 'Kode OTP salah.'], 422);
        }

        $profile->forceFill([
            'application_number' => $profile->application_number ?: $this->generateApplicationNumber(),
            'application_status' => 'pending',
            'otp_code_hash' => null,
            'otp_verified_at' => now(),
            'submitted_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'OTP berhasil diverifikasi. Pengajuan masuk review admin.',
            'profile' => $profile->fresh(),
        ]);
    }

    private function generateApplicationNumber(): string
    {
        do {
            $number = 'APP-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
        } while (
            \App\Models\CreditCardProfile::where('application_number', $number)->exists()
        );

        return $number;
    }

    private function normalizePhoneTarget(?string $phone): string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        if (str_starts_with($digits, '0')) {
            return (string) config('services.fonnte.country_code', '60') . ltrim($digits, '0');
        }

        return $digits;
    }
}
