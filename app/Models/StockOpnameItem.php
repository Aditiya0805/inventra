<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpnameItem extends Model
{
    protected $fillable = [
        'stock_opname_id', 'asset_id', 'system_qty', 'counted_qty', 'difference', 'note',
    ];

    protected function casts(): array
    {
        return [
            'system_qty' => 'integer',
            'counted_qty' => 'integer',
            'difference' => 'integer',
        ];
    }

    public function opname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
