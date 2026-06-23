<?php

namespace App\Http\Controllers;

use App\Models\CreditCardProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AdminWebController extends Controller
{
    public function loginForm()
    {
        if (Auth::check() && Auth::user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withErrors(['email' => 'Email atau password admin salah.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        if (! Auth::user()->isAdmin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()
                ->withErrors(['email' => 'Akun ini tidak memiliki akses admin.'])
                ->onlyInput('email');
        }

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    public function dashboard(Request $request)
    {
        $this->ensureAdmin();

        $status = $request->query('status');
        $profiles = CreditCardProfile::query()
            ->with(['user.verificationDocuments', 'reviewer'])
            ->where('application_status', '!=', 'draft')
            ->when($status, fn ($query) => $query->where('application_status', $status))
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString();

        $counts = CreditCardProfile::query()
            ->where('application_status', '!=', 'draft')
            ->selectRaw('application_status, count(*) as total')
            ->groupBy('application_status')
            ->pluck('total', 'application_status');

        return view('admin.dashboard', [
            'counts' => $counts,
            'profiles' => $profiles,
            'status' => $status,
        ]);
    }

    public function show(CreditCardProfile $profile)
    {
        $this->ensureAdmin();

        return view('admin.show', [
            'profile' => $profile->load(['user.verificationDocuments', 'reviewer']),
        ]);
    }

    public function review(Request $request, CreditCardProfile $profile)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'application_status' => ['required', Rule::in(['approved', 'rejected'])],
            'credit_limit' => ['required_if:application_status,approved', 'nullable', 'numeric', 'min:0'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $profile->update([
            'admin_notes' => $data['admin_notes'] ?? null,
            'application_status' => $data['application_status'],
            'credit_limit' => $data['application_status'] === 'approved' ? $data['credit_limit'] : null,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        return redirect()
            ->route('admin.applications.show', $profile)
            ->with('success', 'Pengajuan berhasil direview.');
    }

    private function ensureAdmin(): void
    {
        abort_unless(Auth::check() && Auth::user()->isAdmin(), 403);
    }
}
