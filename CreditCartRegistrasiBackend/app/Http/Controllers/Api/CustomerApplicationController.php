<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerApplicationController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('creditCardProfile', 'verificationDocuments');

        return response()->json([
            'profile' => $user->creditCardProfile,
            'documents' => $user->verificationDocuments,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'nik' => ['required', 'string', 'max:20'],
            'birth_place' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'locality' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:12'],
            'occupation' => ['required', 'string', 'max:255'],
            'monthly_income' => ['required', 'numeric', 'min:0'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'work_address' => ['nullable', 'string'],
            'work_city' => ['nullable', 'string', 'max:255'],
            'work_province' => ['nullable', 'string', 'max:255'],
            'work_district' => ['nullable', 'string', 'max:255'],
            'work_locality' => ['nullable', 'string', 'max:255'],
            'work_postal_code' => ['nullable', 'string', 'max:12'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'max:30'],
        ]);

        $profile = $request->user()->creditCardProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            array_merge($data, ['application_status' => 'otp_pending'])
        );

        return response()->json([
            'message' => 'Profil pengajuan berhasil disimpan.',
            'profile' => $profile,
        ]);
    }

    public function uploadDocument(Request $request, string $type)
    {
        abort_unless(in_array($type, ['ktp', 'face'], true), 404);

        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $path = $data['file']->store("verifications/{$request->user()->id}", 'public');

        $document = $request->user()->verificationDocuments()->updateOrCreate(
            ['type' => $type],
            [
                'file_path' => $path,
                'status' => 'pending',
                'notes' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        return response()->json([
            'message' => 'Dokumen verifikasi berhasil diunggah.',
            'document' => $document,
        ], 201);
    }
}
