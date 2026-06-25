<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'api_token',
        'password',
        'transaction_pin_hash',
        'transaction_pin_updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'transaction_pin_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'transaction_pin_updated_at' => 'datetime',
        ];
    }

    public function creditCardProfile()
    {
        return $this->hasOne(CreditCardProfile::class);
    }

    public function verificationDocuments()
    {
        return $this->hasMany(VerificationDocument::class);
    }

    public function cardPayments()
    {
        return $this->hasMany(CardPayment::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function readsSmsAis()
    {
        return $this->hasMany(ReadsSmsAi::class);
    }
}
