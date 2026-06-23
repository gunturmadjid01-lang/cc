<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AddressSearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'min:4', 'max:255'],
        ]);

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => 'NexaBankCreditCard/1.0 (address-search; local-development)',
        ])
            ->timeout(12)
            ->get('https://nominatim.openstreetmap.org/search', [
                'accept-language' => 'id,en,ms',
                'addressdetails' => 1,
                'countrycodes' => 'my',
                'format' => 'jsonv2',
                'limit' => 5,
                'q' => $data['q'],
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Pencarian alamat sedang tidak tersedia. Silakan isi alamat manual.',
            ], 502);
        }

        $results = collect($response->json())
            ->map(function (array $place) {
                $address = $place['address'] ?? [];
                $city = $address['city']
                    ?? $address['town']
                    ?? $address['village']
                    ?? $address['municipality']
                    ?? '';
                $state = $address['state']
                    ?? $this->stateFromIsoCode($address['ISO3166-2-lvl4'] ?? null)
                    ?? $city;

                return [
                    'city' => $city,
                    'displayName' => $place['display_name'] ?? '',
                    'district' => $address['county'] ?? $address['state_district'] ?? $city,
                    'locality' => $address['suburb'] ?? $address['neighbourhood'] ?? '',
                    'placeId' => $place['place_id'] ?? null,
                    'postalCode' => $address['postcode'] ?? '',
                    'state' => $state,
                ];
            })
            ->filter(fn (array $place) => filled($place['displayName']))
            ->values();

        return response()->json([
            'results' => $results,
        ]);
    }

    private function stateFromIsoCode(?string $code): ?string
    {
        return match ($code) {
            'MY-01' => 'Johor',
            'MY-02' => 'Kedah',
            'MY-03' => 'Kelantan',
            'MY-04' => 'Melaka',
            'MY-05' => 'Negeri Sembilan',
            'MY-06' => 'Pahang',
            'MY-07' => 'Pulau Pinang',
            'MY-08' => 'Perak',
            'MY-09' => 'Perlis',
            'MY-10' => 'Selangor',
            'MY-11' => 'Terengganu',
            'MY-12' => 'Sabah',
            'MY-13' => 'Sarawak',
            'MY-14' => 'Wilayah Persekutuan Kuala Lumpur',
            'MY-15' => 'Wilayah Persekutuan Labuan',
            'MY-16' => 'Wilayah Persekutuan Putrajaya',
            default => null,
        };
    }
}
