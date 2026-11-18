<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetStock extends Model
{
    protected $fillable = [
        'asset_id', 'room_id', 'qty_in_use', 'qty_available', 'qty_damaged',
        'qty_repair', 'qty_lost',
    ];

    protected function casts(): array
    {
        return [
            'qty_in_use' => 'integer',
            'qty_available' => 'integer',
            'qty_damaged' => 'integer',
            'qty_repair' => 'integer',
            'qty_lost' => 'integer',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function getTotalAttribute(): int
    {
        return $this->qty_in_use + $this->qty_available + $this->qty_damaged
            + $this->qty_repair + $this->qty_lost;
    }
}
