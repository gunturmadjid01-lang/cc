<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user()->load([
            'creditCardProfile.payments' => fn ($query) => $query->latest()->limit(5),
            'verificationDocuments',
        ]);
        $profile = $user->creditCardProfile;

        return response()->json([
            'user' => $user,
            'profile' => $profile,
            'documents' => $user->verificationDocuments,
            'card' => $profile ? [
                'number' => $profile->card_number,
                'masked_number' => $profile->card_number ? '•••• •••• •••• ' . substr($profile->card_number, -4) : '•••• •••• •••• ••••',
                'holder_name' => $profile->card_holder_name,
                'expiry' => $profile->card_expiry_month && $profile->card_expiry_year
                    ? $profile->card_expiry_month . '/' . substr($profile->card_expiry_year, -2)
                    : null,
                'status' => $profile->application_status,
            ] : null,
            'limit' => [
                'credit_limit' => $profile?->credit_limit,
                'available_limit' => $profile?->available_limit,
                'unlocked' => (bool) $profile?->credit_limit_unlocked_at,
                'initial_deposit_amount' => $profile?->initial_deposit_amount,
                'initial_deposit_status' => $profile?->initial_deposit_status,
            ],
            'payments' => $profile?->payments ?? [],
            'rewards_points' => 0,
        ]);
    }
}
