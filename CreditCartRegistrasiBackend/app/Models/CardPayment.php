<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'credit_card_profile_id',
        'order_id',
        'type',
        'amount',
        'status',
        'midtrans_token',
        'midtrans_redirect_url',
        'midtrans_transaction_id',
        'payload',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payload' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function profile()
    {
        return $this->belongsTo(CreditCardProfile::class, 'credit_card_profile_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
