<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLES = [
        'super_admin' => 'Super Admin',
        'admin_sarpras' => 'Admin Sarpras',
        'guru' => 'Guru / Staf',
        'teknisi' => 'Teknisi',
        'viewer' => 'Viewer',
    ];

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'job_title', 'is_active', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function roomBookings(): HasMany
    {
        return $this->hasMany(RoomBooking::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'borrower_id');
    }

    public function reportedTickets(): HasMany
    {
        return $this->hasMany(DamageTicket::class, 'reporter_id');
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(DamageTicket::class, 'technician_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin_sarpras'], true);
    }

    public function isTechnician(): bool
    {
        return $this->role === 'teknisi';
    }

    public function isViewer(): bool
    {
        return $this->role === 'viewer';
    }

    public function canManage(): bool
    {
        return $this->isAdmin();
    }

    public function canOperate(): bool
    {
        return in_array($this->role, ['super_admin', 'admin_sarpras', 'teknisi'], true);
    }

    public function roleLabel(): string
    {
        return self::ROLES[$this->role] ?? $this->role;
    }

    public function initials(): string
    {
        $parts = explode(' ', trim($this->name));
        $initials = strtoupper(substr($parts[0] ?? '', 0, 1));
        if (count($parts) > 1) {
            $initials .= strtoupper(substr(end($parts), 0, 1));
        }

        return $initials;
    }
}
