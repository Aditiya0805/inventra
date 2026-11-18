<?php

namespace App\Support;

use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Support\Collection;

class Notifier
{
    /**
     * Kirim notifikasi dalam aplikasi ke satu atau banyak pengguna.
     *
     * @param  User|Collection|array<int, User>  $recipients
     */
    public static function send(
        User|Collection|array $recipients,
        string $title,
        string $message,
        ?string $url = null,
        string $type = 'info',
    ): void {
        $users = $recipients instanceof User ? collect([$recipients]) : collect($recipients);
        $users = $users->filter(fn ($user) => $user instanceof User)
            ->unique('id');

        foreach ($users as $user) {
            AppNotification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'url' => $url,
            ]);
        }
    }

    /**
     * Semua pengguna dengan peran tertentu.
     *
     * @param  array<int, string>  $roles
     */
    public static function role(array $roles): Collection
    {
        return User::query()->whereIn('role', $roles)->where('is_active', true)->get();
    }

    public static function admins(): Collection
    {
        return self::role(['super_admin', 'admin_sarpras']);
    }
}
