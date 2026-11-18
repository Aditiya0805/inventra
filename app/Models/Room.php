<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    public const TYPES = [
        'kelas' => 'Ruang Kelas',
        'laboratorium' => 'Laboratorium',
        'perpustakaan' => 'Perpustakaan',
        'aula' => 'Aula',
        'kantor' => 'Kantor',
        'ruang_guru' => 'Ruang Guru',
        'mushola' => 'Mushola',
        'kantin' => 'Kantin',
        'lainnya' => 'Lainnya',
    ];

    public const STATUSES = [
        'tersedia' => 'Tersedia',
        'perawatan' => 'Perawatan',
        'ditutup' => 'Ditutup',
    ];

    protected $fillable = [
        'building_id', 'code', 'name', 'type', 'floor', 'capacity', 'status',
        'responsible_user_id', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'floor' => 'integer',
            'capacity' => 'integer',
        ];
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(RoomBooking::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(DamageTicket::class);
    }

    public function typeLabel(): string
    {
        return self::TYPES[$this->type] ?? ucfirst($this->type);
    }

    /**
     * Status ruangan yang ditampilkan: digabung dengan jadwal pemesanan yang disetujui.
     */
    public function displayStatus(?string $at = null): string
    {
        if ($this->status !== 'tersedia') {
            return $this->status;
        }

        $moment = $at ? \Illuminate\Support\Carbon::parse($at) : now();

        $active = $this->bookings()
            ->where('status', 'disetujui')
            ->where('starts_at', '<=', $moment)
            ->where('ends_at', '>=', $moment)
            ->exists();

        if ($active) {
            return 'dipakai';
        }

        $upcoming = $this->bookings()
            ->whereIn('status', ['disetujui', 'menunggu'])
            ->where('starts_at', '>', $moment)
            ->whereDate('starts_at', $moment->toDateString())
            ->exists();

        return $upcoming ? 'dipesan' : 'tersedia';
    }

    public function displayStatusLabel(): string
    {
        return [
            'tersedia' => 'Tersedia',
            'dipakai' => 'Sedang Dipakai',
            'dipesan' => 'Dipesan',
            'perawatan' => 'Perawatan',
            'ditutup' => 'Ditutup',
        ][$this->displayStatus()] ?? 'Tersedia';
    }
}
