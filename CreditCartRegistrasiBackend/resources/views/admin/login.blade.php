@extends('admin.layout')

@section('title', 'Login Admin Nexa')
@section('plain', true)

@section('content')
    <div style="min-height:100vh;display:grid;place-items:center;background:#f5f8fe;padding:22px;">
        <form class="card" method="POST" action="{{ route('admin.login.submit') }}" style="width:min(430px,100%);">
            @csrf
            <h1>Login Admin</h1>
            <p class="subtitle">Masuk untuk memeriksa dan memutuskan pengajuan kartu kredit.</p>

            @if ($errors->any())
                <div class="alert error">{{ $errors->first() }}</div>
            @endif

            <div class="grid" style="margin-top:18px;">
                <label class="form-row">
                    <span>Email</span>
                    <input name="email" type="email" value="{{ old('email', 'admin@credit.test') }}" required>
                </label>
                <label class="form-row">
                    <span>Password</span>
                    <input name="password" type="password" value="password123" required>
                </label>
                <label style="align-items:center;display:flex;gap:8px;font-size:13px;">
                    <input name="remember" type="checkbox" value="1" style="min-height:auto;width:auto;">
                    Ingat saya
                </label>
                <button class="button" type="submit">Masuk</button>
            </div>
        </form>
    </div>
@endsection
