<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends Model
{
    protected $fillable = ['code', 'name', 'floors_count', 'notes'];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function assetsCount(): int
    {
        return Asset::query()->whereIn('room_id', $this->rooms()->select('id'))->count();
    }
}
