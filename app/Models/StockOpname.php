<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockOpname extends Model
{
    protected $fillable = ['code', 'room_id', 'user_id', 'date', 'status', 'notes'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    public function differenceTotal(): int
    {
        return (int) $this->items()->sum('difference');
    }

    public static function generateCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last ? ((int) preg_replace('/\D/', '', $last->code)) + 1 : 1;

        return 'OPN-'.now()->format('Ym').'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
