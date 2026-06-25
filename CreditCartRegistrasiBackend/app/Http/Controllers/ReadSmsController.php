<?php

namespace App\Http\Controllers;

use App\Models\ReadsSmsAi;
use Illuminate\Http\Request;

class ReadSmsController extends Controller
{
    public function readSms(Request $request)
    {
        $from = $request->sender;
        $body = $request->message;

        // Log the received SMS for debugging purposes

        $read = ReadsSmsAi::create([
            'user_id' => $request->user()->id, // Replace with the actual user ID if needed
            'from' => $from,
            'body' => $body,
        ]);
        // Here you can add your logic to process the SMS, e.g., extract OTP, etc.
        \Log::info($read);
        return response()->json(['message' => 'SMS received successfully'], 200);
    }
}
