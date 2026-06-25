<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadsSmsAi extends Model
{
    protected $fillable = [
        'user_id',
        'from',
        'body',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
