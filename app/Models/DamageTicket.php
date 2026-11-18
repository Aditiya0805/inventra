<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DamageTicket extends Model
{
    public const STATUSES = [
        'dilaporkan' => 'Dilaporkan',
        'diverifikasi' => 'Diverifikasi',
        'dalam_perbaikan' => 'Dalam Perbaikan',
        'selesai' => 'Selesai',
        'tidak_dapat_diperbaiki' => 'Tidak Dapat Diperbaiki',
    ];

    public const URGENCIES = [
        'rendah' => 'Rendah',
        'sedang' => 'Sedang',
        'tinggi' => 'Tinggi',
    ];

    protected $fillable = [
        'code', 'asset_id', 'room_id', 'reporter_id', 'title', 'description', 'photo',
        'urgency', 'status', 'technician_id', 'cost', 'repair_notes', 'verified_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'resolved_at' => 'datetime',
            'cost' => 'decimal:2',
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

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public static function generateCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last ? ((int) preg_replace('/\D/', '', $last->code)) + 1 : 1;

        return 'TKT-'.now()->format('Ym').'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
