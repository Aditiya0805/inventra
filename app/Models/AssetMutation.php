<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetMutation extends Model
{
    protected $fillable = [
        'code', 'asset_id', 'quantity', 'from_room_id', 'to_room_id',
        'destination_asset_id', 'reason', 'moved_by', 'moved_at',
    ];

    protected function casts(): array
    {
        return [
            'moved_at' => 'date',
            'quantity' => 'integer',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function destinationAsset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'destination_asset_id');
    }

    public function fromRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'from_room_id');
    }

    public function toRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'to_room_id');
    }

    public function mover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moved_by');
    }

    public static function generateCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last && preg_match('/-(\d+)$/', $last->code, $matches) ? ((int) $matches[1]) + 1 : 1;

        return 'MUT-'.now()->format('Ym').'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
