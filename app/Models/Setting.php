<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = Cache::rememberForever('inventra.settings', function () {
            return static::query()->pluck('value', 'key')->all();
        });

        return $settings[$key] ?? $default;
    }

    public static function put(string $key, mixed $value, string $group = 'umum'): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
        Cache::forget('inventra.settings');
    }

    public static function allSettings(): array
    {
        return Cache::rememberForever('inventra.settings', function () {
            return static::query()->pluck('value', 'key')->all();
        });
    }
}
