<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Admin Nexa Bank')</title>
    <style>
        :root {
            --blue: #075bea;
            --ink: #071946;
            --line: #e3ebf7;
            --muted: #66758a;
            --navy: #06185f;
            --pale: #f5f8fe;
            --white: #fff;
        }
        * { box-sizing: border-box; }
        body { margin: 0; color: var(--ink); background: var(--pale); font-family: Arial, sans-serif; }
        a { color: inherit; text-decoration: none; }
        .shell { min-height: 100vh; display: grid; grid-template-columns: 250px 1fr; }
        .sidebar { color: #fff; background: var(--navy); padding: 28px 22px; }
        .brand { font-size: 20px; font-weight: 900; letter-spacing: .02em; }
        .side-note { color: #a9c7ff; font-size: 12px; line-height: 18px; margin-top: 8px; }
        .nav { display: grid; gap: 10px; margin-top: 34px; }
        .nav a, .logout-button { display: block; width: 100%; color: #dce9ff; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px; text-align: left; }
        .logout-button { cursor: pointer; font: inherit; }
        .main { padding: 30px; }
        .topbar { align-items: center; display: flex; gap: 16px; justify-content: space-between; margin-bottom: 24px; }
        h1 { font-size: 28px; line-height: 34px; margin: 0; }
        .subtitle { color: var(--muted); font-size: 13px; margin-top: 6px; }
        .card { background: var(--white); border: 1px solid var(--line); border-radius: 8px; padding: 18px; }
        .grid { display: grid; gap: 14px; }
        .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 18px; }
        .stat strong { display: block; font-size: 24px; }
        .stat span { color: var(--muted); font-size: 12px; }
        .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .pill { border: 1px solid var(--line); border-radius: 999px; color: var(--muted); display: inline-flex; font-size: 12px; font-weight: 800; padding: 8px 12px; }
        .pill.active { background: var(--navy); border-color: var(--navy); color: #fff; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border-bottom: 1px solid var(--line); font-size: 13px; padding: 13px 10px; text-align: left; vertical-align: top; }
        th { color: var(--muted); font-size: 11px; text-transform: uppercase; }
        .status { border-radius: 999px; display: inline-flex; font-size: 11px; font-weight: 900; padding: 6px 9px; }
        .status.pending, .status.otp_pending { background: #fff6df; color: #9b6200; }
        .status.approved { background: #e7f8ef; color: #0b7a4b; }
        .status.rejected { background: #fdecec; color: #b42318; }
        .button { align-items: center; background: var(--navy); border: 0; border-radius: 8px; color: #fff; cursor: pointer; display: inline-flex; font-weight: 900; justify-content: center; min-height: 42px; padding: 0 14px; }
        .button.secondary { background: #eef4ff; color: var(--blue); }
        .button.danger { background: #b42318; }
        .button.success { background: #0b7a4b; }
        .detail-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        .section-title { font-size: 16px; font-weight: 900; margin: 0 0 14px; }
        .row { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eef2f7; }
        .row span:first-child { color: var(--muted); font-size: 12px; }
        .row span:last-child { font-size: 13px; font-weight: 700; }
        .actions { display: grid; gap: 12px; margin-top: 18px; }
        input, textarea { border: 1px solid #d8e2f0; border-radius: 8px; font: inherit; min-height: 44px; padding: 10px 12px; width: 100%; }
        textarea { min-height: 90px; resize: vertical; }
        .form-row { display: grid; gap: 8px; }
        .alert { border-radius: 8px; font-size: 13px; margin-bottom: 16px; padding: 12px 14px; }
        .alert.success { background: #e7f8ef; color: #0b7a4b; }
        .alert.error { background: #fdecec; color: #b42318; }
        .empty { color: var(--muted); padding: 26px; text-align: center; }
        .pagination { margin-top: 16px; }
        @media (max-width: 900px) {
            .shell { grid-template-columns: 1fr; }
            .sidebar { position: static; }
            .stats, .detail-grid { grid-template-columns: 1fr; }
            .main { padding: 18px; }
            table { display: block; overflow-x: auto; }
        }
    </style>
</head>
<body>
    @hasSection('plain')
        @yield('content')
    @else
        <div class="shell">
            <aside class="sidebar">
                <div class="brand">Nexa Admin</div>
                <div class="side-note">Panel review pengajuan kartu kredit.</div>
                <nav class="nav">
                    <a href="{{ route('admin.dashboard') }}">Pengajuan</a>
                    <a href="{{ url('/') }}">Website Publik</a>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button class="logout-button" type="submit">Logout</button>
                    </form>
                </nav>
            </aside>
            <main class="main">
                @yield('content')
            </main>
        </div>
    @endif
</body>
</html>
