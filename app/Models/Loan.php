<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    public const STATUSES = [
        'menunggu' => 'Menunggu Persetujuan',
        'disetujui' => 'Disetujui',
        'ditolak' => 'Ditolak',
        'dipinjam' => 'Dipinjam',
        'dikembalikan' => 'Dikembalikan',
    ];

    public const BORROWABLE_TYPES = [
        'kelas' => 'Ruang Kelas',
        'ruangan' => 'Ruangan / Lab',
        'gedung' => 'Gedung',
    ];

    protected $fillable = [
        'code',
        'asset_id',
        'room_id',
        'building_id',
        'borrowable_type',
        'quantity',
        'borrower_id',
        'purpose',
        'start_date',
        'due_date',
        'returned_at',
        'status',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'due_date' => 'date',
            'returned_at' => 'datetime',
            'approved_at' => 'datetime',
            'quantity' => 'integer',
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

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isOverdue(): bool
    {
        return in_array($this->status, ['disetujui', 'dipinjam'], true)
            && $this->due_date->isPast();
    }

    public function displayStatus(): string
    {
        return $this->isOverdue() ? 'terlambat' : $this->status;
    }

    public function statusLabel(): string
    {
        return $this->isOverdue() ? 'Terlambat' : (self::STATUSES[$this->status] ?? $this->status);
    }

    public function facilityName(): string
    {
        if ($this->building_id && $this->building) {
            return $this->building->name;
        }

        if ($this->room_id && $this->room) {
            return $this->room->name;
        }

        if ($this->asset_id && $this->asset) {
            return $this->asset->name;
        }

        return 'Fasilitas';
    }

    public function facilityCode(): string
    {
        if ($this->building_id && $this->building) {
            return $this->building->code;
        }

        if ($this->room_id && $this->room) {
            return $this->room->code;
        }

        if ($this->asset_id && $this->asset) {
            return $this->asset->code;
        }

        return '-';
    }

    public function facilityType(): string
    {
        if ($this->borrowable_type) {
            return $this->borrowable_type;
        }

        if ($this->building_id) {
            return 'gedung';
        }

        if ($this->room_id && $this->room) {
            return $this->room->type === 'kelas' ? 'kelas' : 'ruangan';
        }

        return $this->asset_id ? 'aset' : 'ruangan';
    }

    public function facilityTypeLabel(): string
    {
        $type = $this->facilityType();

        return match ($type) {
            'kelas' => 'Ruang Kelas',
            'gedung' => 'Gedung',
            'ruangan' => 'Ruangan / Lab',
            'aset' => 'Aset Sarana',
            default => 'Fasilitas',
        };
    }

    public function facilityLocation(): string
    {
        if ($this->building_id && $this->building) {
            return "Area Sekolah ({$this->building->code})";
        }

        if ($this->room_id && $this->room) {
            $buildingName = $this->room->building?->name ?? 'Gedung Sekolah';
            $floor = $this->room->floor ? " · Lt. {$this->room->floor}" : '';

            return "{$buildingName}{$floor}";
        }

        if ($this->asset_id && $this->asset) {
            return $this->asset->room?->name ?? 'Tanpa ruangan';
        }

        return 'MA Muhammadiyah';
    }

    public static function generateCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last && preg_match('/-(\d+)$/', $last->code, $matches) ? ((int) $matches[1]) + 1 : 1;

        return 'PJM-'.now()->format('Ym').'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
