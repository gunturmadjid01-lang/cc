@extends('admin.layout')

@section('title', 'Detail Pengajuan')

@section('content')
    <div class="topbar">
        <div>
            <h1>Detail Pengajuan</h1>
            <div class="subtitle">{{ $profile->application_number ?? 'Belum ada nomor pengajuan' }}</div>
        </div>
        <a class="button secondary" href="{{ route('admin.dashboard') }}">Kembali</a>
    </div>

    @if (session('success'))
        <div class="alert success">{{ session('success') }}</div>
    @endif

    <div class="detail-grid">
        <section class="card">
            <h2 class="section-title">Data Pribadi</h2>
            <x-admin-row label="Nama" :value="$profile->user->name" />
            <x-admin-row label="Email" :value="$profile->user->email" />
            <x-admin-row label="Telepon" :value="$profile->user->phone" />
            <x-admin-row label="No. Identitas" :value="$profile->nik" />
            <x-admin-row label="Tanggal Lahir" :value="optional($profile->birth_date)->format('d M Y')" />
            <x-admin-row label="Alamat Rumah" :value="$profile->address" />
            <x-admin-row label="Negeri" :value="$profile->province" />
            <x-admin-row label="Daerah" :value="$profile->district" />
            <x-admin-row label="Mukim" :value="$profile->locality" />
            <x-admin-row label="Kota" :value="$profile->city" />
            <x-admin-row label="Kode Pos" :value="$profile->postal_code" />
        </section>

        <section class="card">
            <h2 class="section-title">Pekerjaan</h2>
            <x-admin-row label="Status" :value="$profile->occupation" />
            <x-admin-row label="Perusahaan" :value="$profile->company_name" />
            <x-admin-row label="Penghasilan" :value="$profile->monthly_income" />
            <x-admin-row label="Alamat Kantor" :value="$profile->work_address" />
            <x-admin-row label="Negeri" :value="$profile->work_province" />
            <x-admin-row label="Daerah" :value="$profile->work_district" />
            <x-admin-row label="Mukim" :value="$profile->work_locality" />
            <x-admin-row label="Kota" :value="$profile->work_city" />
            <x-admin-row label="Kode Pos" :value="$profile->work_postal_code" />
        </section>
    </div>

    <div class="detail-grid" style="margin-top:16px;">
        <section class="card">
            <h2 class="section-title">Dokumen</h2>
            @forelse ($profile->user->verificationDocuments as $document)
                <div class="row">
                    <span>{{ strtoupper($document->type) }}</span>
                    <span>
                        <a href="{{ $document->file_url }}" target="_blank">Lihat dokumen</a>
                        <br><span class="status {{ $document->status }}">{{ status_label($document->status) }}</span>
                    </span>
                </div>
            @empty
                <div class="subtitle">Customer belum mengunggah dokumen. Dokumen bersifat opsional.</div>
            @endforelse
        </section>

        <section class="card">
            <h2 class="section-title">Keputusan Admin</h2>
            <div style="margin-bottom:14px;">
                <span class="status {{ $profile->application_status }}">{{ status_label($profile->application_status) }}</span>
            </div>
            <form class="actions" method="POST" action="{{ route('admin.applications.review', $profile) }}">
                @csrf
                <label class="form-row">
                    <span>Limit Kredit jika disetujui</span>
                    <input name="credit_limit" type="number" min="0" step="1000" value="{{ old('credit_limit', $profile->credit_limit ?? 5000000) }}">
                </label>
                <label class="form-row">
                    <span>Catatan Admin</span>
                    <textarea name="admin_notes">{{ old('admin_notes', $profile->admin_notes) }}</textarea>
                </label>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="button success" name="application_status" value="approved" type="submit">Setujui</button>
                    <button class="button danger" name="application_status" value="rejected" type="submit">Tolak</button>
                </div>
            </form>
        </section>
    </div>
@endsection
