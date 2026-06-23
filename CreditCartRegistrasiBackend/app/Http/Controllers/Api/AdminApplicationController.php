<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditCardProfile;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
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
            'admin_notes' => ['nullable', 'string'],
        ]);

        $profile->update([
            'application_status' => $data['application_status'],
            'credit_limit' => $data['application_status'] === 'approved' ? $data['credit_limit'] : null,
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil direview.',
            'profile' => $profile->fresh(['user.verificationDocuments', 'reviewer']),
        ]);
    }
}
