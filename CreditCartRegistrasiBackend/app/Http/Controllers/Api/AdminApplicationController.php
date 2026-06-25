<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditCardProfile;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminApplicationController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Akses admin diperlukan.'], 403);
        }

        $profiles = CreditCardProfile::query()
            ->with(['user.verificationDocuments', 'reviewer'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('application_status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($profiles);
    }

    public function reviewDocument(Request $request, VerificationDocument $document)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Akses admin diperlukan.'], 403);
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'notes' => ['nullable', 'string'],
        ]);

        $document->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Status dokumen berhasil diperbarui.',
            'document' => $document->fresh(),
        ]);
    }

    public function reviewApplication(Request $request, CreditCardProfile $profile)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Akses admin diperlukan.'], 403);
        }

        $data = $request->validate([
            'application_status' => ['required', Rule::in(['approved', 'rejected'])],
            'credit_limit' => ['required_if:application_status,approved', 'nullable', 'numeric', 'min:0'],
            'initial_deposit_amount' => ['required_if:application_status,approved', 'nullable', 'numeric', 'min:0'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $cardData = [];

        if ($data['application_status'] === 'approved') {
            $approvedRequiredDocuments = $profile->user->verificationDocuments()
                ->whereIn('type', ['ktp', 'npwp', 'selfie'])
                ->where('status', 'approved')
                ->count();

            if ($approvedRequiredDocuments < 3) {
                return response()->json([
                    'message' => 'Dokumen wajib KTP, NPWP, dan selfie harus disetujui sebelum pengajuan di-approve.',
                ], 422);
            }

            $cardData = [
                'card_number' => $profile->card_number ?: $this->generateCardNumber(),
                'card_holder_name' => Str::upper($profile->user->name),
                'card_expiry_month' => $profile->card_expiry_month ?: now()->addYears(5)->format('m'),
                'card_expiry_year' => $profile->card_expiry_year ?: now()->addYears(5)->format('Y'),
                'available_limit' => 0,
                'initial_deposit_amount' => $data['initial_deposit_amount'] ?? 0,
                'initial_deposit_status' => ((float) ($data['initial_deposit_amount'] ?? 0)) > 0 ? 'pending' : 'paid',
                'credit_limit_unlocked_at' => ((float) ($data['initial_deposit_amount'] ?? 0)) > 0 ? null : now(),
            ];
        }

        $profile->update(array_merge([
            'application_status' => $data['application_status'],
            'credit_limit' => $data['application_status'] === 'approved' ? $data['credit_limit'] : null,
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ], $cardData));

        return response()->json([
            'message' => 'Pengajuan berhasil direview.',
            'profile' => $profile->fresh(['user.verificationDocuments', 'reviewer']),
        ]);
    }

    private function generateCardNumber(): string
    {
        do {
            $number = '4899' . random_int(1000, 9999) . random_int(1000, 9999) . random_int(1000, 9999);
        } while (CreditCardProfile::where('card_number', $number)->exists());

        return $number;
    }
}
