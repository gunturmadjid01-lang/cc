@extends('admin.layout')

@section('title', 'Dashboard Admin Nexa')

@section('content')
    <div class="topbar">
        <div>
            <h1>Pengajuan Kartu Kredit</h1>
            <div class="subtitle">Review pengajuan yang sudah dikirim customer.</div>
        </div>
    </div>

    <div class="grid stats">
        @foreach (['otp_pending' => 'Menunggu OTP', 'pending' => 'Verifikasi Admin', 'approved' => 'Disetujui', 'rejected' => 'Ditolak'] as $key => $label)
            <div class="card stat">
                <strong>{{ $counts[$key] ?? 0 }}</strong>
                <span>{{ $label }}</span>
            </div>
        @endforeach
    </div>

    <div class="filters">
        <a class="pill {{ $status ? '' : 'active' }}" href="{{ route('admin.dashboard') }}">Semua</a>
        @foreach (['otp_pending' => 'OTP', 'pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected'] as $key => $label)
            <a class="pill {{ $status === $key ? 'active' : '' }}" href="{{ route('admin.dashboard', ['status' => $key]) }}">{{ $label }}</a>
        @endforeach
    </div>

    <div class="card">
        <table>
            <thead>
                <tr>
                    <th>No. Pengajuan</th>
                    <th>Customer</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Dikirim</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($profiles as $profile)
                    <tr>
                        <td>{{ $profile->application_number ?? '-' }}</td>
                        <td>
                            <strong>{{ $profile->user->name }}</strong><br>
                            <span class="subtitle">{{ $profile->nik ?? '-' }}</span>
                        </td>
                        <td>{{ $profile->user->email }}<br><span class="subtitle">{{ $profile->user->phone }}</span></td>
                        <td><span class="status {{ $profile->application_status }}">{{ status_label($profile->application_status) }}</span></td>
                        <td>{{ optional($profile->submitted_at)->format('d M Y H:i') ?? '-' }}</td>
                        <td><a class="button secondary" href="{{ route('admin.applications.show', $profile) }}">Detail</a></td>
                    </tr>
                @empty
                    <tr><td class="empty" colspan="6">Belum ada pengajuan.</td></tr>
                @endforelse
            </tbody>
        </table>

        <div class="pagination">{{ $profiles->links() }}</div>
    </div>
@endsection
