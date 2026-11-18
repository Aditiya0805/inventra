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

    protected $fillable = [
        'code', 'asset_id', 'quantity', 'borrower_id', 'purpose', 'start_date',
        'due_date', 'returned_at', 'status', 'approved_by', 'approved_at', 'notes',
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

    public static function generateCode(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last ? ((int) preg_replace('/\D/', '', $last->code)) + 1 : 1;

        return 'PJM-'.now()->format('Ym').'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
