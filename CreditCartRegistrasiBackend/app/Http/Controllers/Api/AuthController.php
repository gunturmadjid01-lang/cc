<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(['customer', 'admin'])],
        ]);

        $plainToken = Str::random(64);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'role' => $data['role'] ?? 'customer',
            'password' => $data['password'],
            'api_token' => hash('sha256', $plainToken),
        ]);

        if ($user->role === 'customer') {
            $user->creditCardProfile()->create(['application_status' => 'draft']);
        }

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'token' => $plainToken,
            'user' => $user->load('creditCardProfile', 'verificationDocuments'),
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 422);
        }

        $plainToken = Str::random(64);
        $user->forceFill(['api_token' => hash('sha256', $plainToken)])->save();

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $plainToken,
            'user' => $user->load('creditCardProfile', 'verificationDocuments'),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('creditCardProfile', 'verificationDocuments'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->forceFill(['api_token' => null])->save();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
