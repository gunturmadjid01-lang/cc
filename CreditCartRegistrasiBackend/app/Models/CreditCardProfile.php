<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditCardProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_number',
        'nik',
        'birth_place',
        'birth_date',
        'gender',
        'address',
        'city',
        'province',
        'district',
        'locality',
        'postal_code',
        'occupation',
        'monthly_income',
        'company_name',
        'work_address',
        'work_city',
        'work_province',
        'work_district',
        'work_locality',
        'work_postal_code',
        'emergency_contact_name',
        'emergency_contact_phone',
        'application_status',
        'status_profile',
        'credit_limit',
        'card_number',
        'card_holder_name',
        'card_expiry_month',
        'card_expiry_year',
        'available_limit',
        'initial_deposit_amount',
        'initial_deposit_status',
        'credit_limit_unlocked_at',
        'admin_notes',
        'otp_code_hash',
        'otp_expires_at',
        'otp_verified_at',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'monthly_income' => 'decimal:2',
            'status_profile' => 'boolean',
            'credit_limit' => 'decimal:2',
            'available_limit' => 'decimal:2',
            'initial_deposit_amount' => 'decimal:2',
            'credit_limit_unlocked_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'otp_verified_at' => 'datetime',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function payments()
    {
        return $this->hasMany(CardPayment::class);
    }
}
