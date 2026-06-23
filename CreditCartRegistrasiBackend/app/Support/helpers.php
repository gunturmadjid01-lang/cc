<?php

if (! function_exists('status_label')) {
    function status_label(?string $status): string
    {
        return [
            'approved' => 'Disetujui',
            'otp_pending' => 'Menunggu OTP',
            'pending' => 'Menunggu Admin',
            'rejected' => 'Ditolak',
        ][$status] ?? ($status ?: '-');
    }
}
