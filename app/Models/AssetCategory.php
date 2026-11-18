<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCategory extends Model
{
    public const GROUPS = [
        'furniture' => 'Furniture',
        'perangkat' => 'Perangkat',
        'consumable' => 'Habis Pakai',
        'lainnya' => 'Lainnya',
    ];

    public const TRACKING_TYPES = [
        'individual' => 'Per Unit',
        'bulk' => 'Massal / Jumlah',
    ];

    protected $fillable = [
        'name', 'slug', 'group', 'tracking_type', 'icon', 'color', 'min_stock',
    ];

    protected function casts(): array
    {
        return ['min_stock' => 'integer'];
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'category_id');
    }

    public function isBulk(): bool
    {
        return $this->tracking_type === 'bulk';
    }
}
