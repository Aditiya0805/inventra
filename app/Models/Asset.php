<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use SoftDeletes;

    public const STATUSES = [
        'tersedia' => 'Tersedia',
        'dipakai' => 'Dipakai',
        'dipinjam' => 'Dipinjam',
        'rusak' => 'Rusak',
        'perbaikan' => 'Dalam Perbaikan',
        'hilang' => 'Hilang',
        'dihapuskan' => 'Dihapuskan',
    ];

    public const STATUS_COLORS = [
        'tersedia' => 'emerald',
        'dipakai' => 'blue',
        'dipinjam' => 'indigo',
        'rusak' => 'rose',
        'perbaikan' => 'amber',
        'hilang' => 'slate',
        'dihapuskan' => 'gray',
    ];

    protected $fillable = [
        'code', 'name', 'category_id', 'room_id', 'brand', 'model', 'serial_number',
        'acquisition_date', 'value', 'funding_source', 'status', 'photo', 'notes',
        'is_consumable', 'min_stock', 'disposal_reason', 'disposed_at',
    ];

    protected function casts(): array
    {
        return [
            'acquisition_date' => 'date',
            'disposed_at' => 'datetime',
            'value' => 'decimal:2',
            'is_consumable' => 'boolean',
            'min_stock' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->photo) : null;
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function stock(): HasOne
    {
        return $this->hasOne(AssetStock::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(AssetStock::class);
    }

    public function mutations(): HasMany
    {
        return $this->hasMany(AssetMutation::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(DamageTicket::class);
    }

    public function isBulk(): bool
    {
        return (bool) $this->category?->isBulk();
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function statusColor(): string
    {
        return self::STATUS_COLORS[$this->status] ?? 'slate';
    }

    /**
     * Ringkasan jumlah untuk aset massal maupun unit.
     *
     * @return array{total:int,dipakai:int,tersedia:int,rusak:int,perbaikan:int,hilang:int}
     */
    public function quantitySummary(): array
    {
        if ($this->isBulk()) {
            $stock = $this->stock;

            return [
                'total' => $stock ? $stock->total : 0,
                'dipakai' => $stock->qty_in_use ?? 0,
                'tersedia' => $stock->qty_available ?? 0,
                'rusak' => $stock->qty_damaged ?? 0,
                'perbaikan' => $stock->qty_repair ?? 0,
                'hilang' => $stock->qty_lost ?? 0,
            ];
        }

        return [
            'total' => 1,
            'dipakai' => $this->status === 'dipakai' ? 1 : 0,
            'tersedia' => $this->status === 'tersedia' ? 1 : 0,
            'rusak' => $this->status === 'rusak' ? 1 : 0,
            'perbaikan' => $this->status === 'perbaikan' ? 1 : 0,
            'hilang' => $this->status === 'hilang' ? 1 : 0,
        ];
    }

    public function isLowStock(): bool
    {
        if (! $this->is_consumable) {
            return false;
        }

        $minimum = $this->min_stock ?? $this->category?->min_stock ?? 0;

        return $this->quantitySummary()['tersedia'] <= $minimum;
    }

    public static function generateCode(AssetCategory $category): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $category->name) ?: 'AST', 0, 3));
        $last = static::withTrashed()->where('code', 'like', $prefix.'-%')->orderByDesc('id')->first();
        $number = 1;
        if ($last && preg_match('/-(\d+)$/', $last->code, $m)) {
            $number = ((int) $m[1]) + 1;
        }

        return sprintf('%s-%04d', $prefix, $number);
    }
}
