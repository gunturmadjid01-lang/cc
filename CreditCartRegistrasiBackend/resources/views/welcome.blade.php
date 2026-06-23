<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#06185f">
    <meta name="description" content="Mohon Kad Kredit Nexa Bank dengan mudah dan urus kewangan anda terus dari telefon.">
    <title>Nexa Bank — Kad Kredit Lebih Mudah</title>
    <link rel="icon" href="{{ asset('logo_nexa-removebg-preview.png') }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <header class="site-header" id="atas">
        <nav class="nav container" aria-label="Navigasi utama">
            <a class="brand" href="#atas" aria-label="Nexa Bank, kembali ke atas">
                <img src="{{ asset('logo_nexa-removebg-preview.png') }}" alt="Nexa Bank">
            </a>

            <button class="menu-toggle" type="button" aria-label="Buka menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>

            <div class="nav-links">
                <a href="#kelebihan">Kelebihan</a>
                <a href="#cara">Cara Memohon</a>
                <a href="#keselamatan">Keselamatan</a>
                <a href="#soalan">Soalan Lazim</a>
            </div>

            <a class="button button-small nav-download" href="{{ asset('downloads/nexa-bank.apk') }}" download>
                Muat Turun Aplikasi
            </a>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-glow hero-glow-one"></div>
            <div class="hero-glow hero-glow-two"></div>
            <div class="container hero-grid">
                <div class="hero-copy reveal">
                    <div class="eyebrow"><span></span> Aplikasi kad kredit generasi baharu</div>
                    <h1>Kad kredit yang menjadikan hidup <em>lebih mudah.</em></h1>
                    <p>Mohon kad, semak status permohonan dan urus transaksi anda dengan selamat — semuanya dalam satu aplikasi Nexa Bank.</p>

                    <div class="hero-actions">
                        <a class="button button-primary download-link" href="{{ asset('downloads/nexa-bank.apk') }}" download>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.6 9.48 14.44 7.7v8.6l3.17-1.78L12.9 12l4.7-2.52ZM3 2.5l10.25 9.5L3 21.5a2.2 2.2 0 0 1-.5-1.4V3.9c0-.52.18-1 .5-1.4Zm11.3 10.47 2.22 1.19-2.68 1.5v-2.75l.46.56Zm2.2-3.13-2.2 1.19-.46.56V8.84l2.67 1.5Z"/></svg>
                            <span><small>Muat turun terus untuk</small>Android</span>
                        </a>
                        <a class="text-link" href="#cara">Lihat cara memohon <span>→</span></a>
                    </div>

                    <div class="download-note">
                        <span class="check">✓</span>
                        Fail APK rasmi Nexa Bank · Pemasangan pantas · Percuma
                    </div>
                </div>

                <div class="hero-visual reveal">
                    <div class="orbit orbit-one"></div>
                    <div class="orbit orbit-two"></div>
                    <div class="floating-pill pill-safe">Dilindungi 24/7</div>
                    <div class="floating-pill pill-fast">Permohonan mudah</div>
                    <img class="phone-mockup" src="{{ asset('preview_mobile_mokeup.png') }}" alt="Paparan aplikasi mudah alih Nexa Bank">
                </div>
            </div>
            <div class="trust-strip">
                <div class="container trust-grid">
                    <div><strong>3 langkah</strong><span>Permohonan ringkas</span></div>
                    <div><strong>24/7</strong><span>Perlindungan akaun</span></div>
                    <div><strong>100%</strong><span>Urusan dalam talian</span></div>
                    <div><strong>Segera</strong><span>Semakan status</span></div>
                </div>
            </div>
        </section>

        <section class="section benefits" id="kelebihan">
            <div class="container">
                <div class="section-heading reveal">
                    <span class="kicker">Semuanya dalam satu aplikasi</span>
                    <h2>Lebih mudah daripada yang anda bayangkan</h2>
                    <p>Direka untuk memberi anda kawalan penuh tanpa proses yang rumit.</p>
                </div>

                <div class="benefit-grid">
                    <article class="benefit-card featured reveal">
                        <div class="icon-box">
                            <svg viewBox="0 0 24 24"><path d="M4 5.5h16v13H4zM4 9h16M7 15h4"/></svg>
                        </div>
                        <h3>Mohon kad dari telefon</h3>
                        <p>Isi maklumat, muat naik dokumen dan hantar permohonan tanpa perlu ke cawangan.</p>
                        <img src="{{ asset('card-removebg-preview.png') }}" alt="Kad kredit Nexa Bank" loading="lazy">
                    </article>
                    <article class="benefit-card reveal">
                        <div class="icon-box">
                            <svg viewBox="0 0 24 24"><path d="M12 3v18M17 7.5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/></svg>
                        </div>
                        <h3>Transaksi lebih jelas</h3>
                        <p>Pantau perbelanjaan dan transaksi terkini secara masa nyata dalam satu paparan.</p>
                    </article>
                    <article class="benefit-card reveal">
                        <div class="icon-box">
                            <svg viewBox="0 0 24 24"><path d="m12 3 8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7zM9 12l2 2 4-4"/></svg>
                        </div>
                        <h3>Selamat dan terlindung</h3>
                        <p>Perlindungan berlapis membantu menjaga data dan setiap aktiviti akaun anda.</p>
                    </article>
                    <article class="benefit-card reveal">
                        <div class="icon-box">
                            <svg viewBox="0 0 24 24"><path d="M4 15V9a8 8 0 0 1 16 0v6M4 14h3v6H4zM17 14h3v6h-3z"/></svg>
                        </div>
                        <h3>Bantuan bila diperlukan</h3>
                        <p>Dapatkan bantuan dan maklumat penting terus melalui pusat sokongan kami.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section steps-section" id="cara">
            <div class="container steps-grid">
                <div class="steps-visual reveal">
                    <div class="visual-panel">
                        <img src="{{ asset('background_jumbotron.jpeg') }}" alt="Kad kredit Nexa Bank" loading="lazy">
                        <div class="status-card">
                            <span class="status-icon">✓</span>
                            <div><small>Status permohonan</small><strong>Berjaya dihantar</strong></div>
                        </div>
                    </div>
                </div>

                <div class="steps-copy">
                    <span class="kicker reveal">Mula dalam beberapa minit</span>
                    <h2 class="reveal">Permohonan ringkas, tanpa pening kepala</h2>
                    <p class="lead reveal">Aplikasi kami membimbing anda dari pendaftaran sehingga permohonan dihantar.</p>
                    <ol class="steps-list">
                        <li class="reveal"><span>01</span><div><h3>Daftar akaun</h3><p>Masukkan maklumat asas dan sahkan akaun anda.</p></div></li>
                        <li class="reveal"><span>02</span><div><h3>Pilih kad & lengkapkan butiran</h3><p>Pilih kad yang sesuai, kemudian isi maklumat peribadi dan pekerjaan.</p></div></li>
                        <li class="reveal"><span>03</span><div><h3>Muat naik & hantar</h3><p>Lampirkan dokumen sokongan dan semak sebelum menghantar permohonan.</p></div></li>
                    </ol>
                    <a class="button button-primary compact download-link" href="{{ asset('downloads/nexa-bank.apk') }}" download>Muat Turun & Mulakan</a>
                </div>
            </div>
        </section>

        <section class="section security" id="keselamatan">
            <div class="container security-card reveal">
                <div>
                    <span class="kicker light">Keselamatan Nexa</span>
                    <h2>Ketenangan fikiran pada setiap sentuhan</h2>
                    <p>Maklumat anda dilindungi melalui kawalan keselamatan berlapis dan amalan perlindungan data yang ketat.</p>
                </div>
                <div class="security-points">
                    <div><span>✓</span>Pengesahan akaun yang selamat</div>
                    <div><span>✓</span>Perlindungan data peribadi</div>
                    <div><span>✓</span>Pemantauan aktiviti berterusan</div>
                </div>
            </div>
        </section>

        <section class="section faq" id="soalan">
            <div class="container faq-grid">
                <div class="section-heading align-left reveal">
                    <span class="kicker">Soalan lazim</span>
                    <h2>Ada yang ingin ditanya?</h2>
                    <p>Kami ringkaskan perkara penting sebelum anda mula.</p>
                </div>
                <div class="accordion">
                    <details class="reveal">
                        <summary>Bagaimanakah cara memasang aplikasi?</summary>
                        <p>Tekan butang “Muat Turun Aplikasi”, buka fail APK yang selesai dimuat turun, kemudian ikuti arahan pemasangan Android.</p>
                    </details>
                    <details class="reveal">
                        <summary>Adakah aplikasi ini percuma?</summary>
                        <p>Ya. Aplikasi Nexa Bank boleh dimuat turun dan dipasang secara percuma.</p>
                    </details>
                    <details class="reveal">
                        <summary>Apakah dokumen yang diperlukan?</summary>
                        <p>Sediakan dokumen pengenalan diri dan dokumen berkaitan pendapatan. Senarai tepat akan dipaparkan semasa permohonan.</p>
                    </details>
                    <details class="reveal">
                        <summary>Bolehkah saya menyemak status permohonan?</summary>
                        <p>Ya. Status permohonan boleh disemak terus dalam aplikasi selepas permohonan dihantar.</p>
                    </details>
                </div>
            </div>
        </section>

        <section class="download-cta">
            <div class="container cta-inner reveal">
                <div>
                    <span class="kicker light">Nexa Bank di dalam poket anda</span>
                    <h2>Bersedia untuk pengalaman kad kredit yang lebih mudah?</h2>
                    <p>Muat turun aplikasi Android Nexa Bank dan mulakan permohonan anda hari ini.</p>
                    <a class="button button-white download-link" href="{{ asset('downloads/nexa-bank.apk') }}" download>
                        Muat Turun Aplikasi Android
                    </a>
                </div>
                <img src="{{ asset('preview_mobile_mokeup.png') }}" alt="Aplikasi Nexa Bank pada telefon Android" loading="lazy">
            </div>
        </section>
    </main>

    <footer>
        <div class="container footer-grid">
            <div class="footer-brand">
                <img src="{{ asset('logo_nexa-removebg-preview.png') }}" alt="Nexa Bank">
                <p>Kad kredit digital yang ringkas, selamat dan dibina untuk kehidupan anda.</p>
            </div>
            <div><strong>Pautan</strong><a href="#kelebihan">Kelebihan</a><a href="#cara">Cara Memohon</a><a href="#soalan">Soalan Lazim</a></div>
            <div><strong>Bantuan</strong><a href="#">Hubungi Kami</a><a href="#">Dasar Privasi</a><a href="#">Terma Penggunaan</a></div>
        </div>
        <div class="container footer-bottom">
            <span>© {{ date('Y') }} Nexa Bank. Hak cipta terpelihara.</span>
            <span>Aplikasi rasmi untuk Android</span>
        </div>
    </footer>

    <a class="mobile-download button button-primary" href="{{ asset('downloads/nexa-bank.apk') }}" download>Muat Turun Aplikasi</a>
    <div class="toast" role="status">Muat turun sedang dimulakan…</div>
</body>
</html>
