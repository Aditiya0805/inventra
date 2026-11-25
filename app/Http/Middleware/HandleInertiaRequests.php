<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $notifications = $user
            ? \App\Models\AppNotification::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(8)
                ->get()
            : collect();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_label' => $user->roleLabel(),
                    'initials' => $user->initials(),
                    'job_title' => $user->job_title,
                    'is_admin' => $user->isAdmin(),
                    'is_super_admin' => $user->isSuperAdmin(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'import_result' => fn () => $request->session()->get('import_result'),
            ],
            'notifications' => [
                'items' => $notifications,
                'unread' => $user ? \App\Models\AppNotification::where('user_id', $user->id)->whereNull('read_at')->count() : 0,
            ],
            'settings' => [
                'school_name' => \App\Models\Setting::get('school_name', 'MA Muhammadiyah Bandar Lampung'),
                'school_address' => \App\Models\Setting::get('school_address', 'Jl. Pulau Sangiang RT 07 LK II, Sukarame, Kota Bandar Lampung, Lampung 35131'),
                'academic_year' => \App\Models\Setting::get('academic_year', '2026/2027'),
                'headmaster' => \App\Models\Setting::get('headmaster', 'Hadi Sururudin, S.Pd.I., M.Pd.'),
                'alert_threshold' => (int) \App\Models\Setting::get('alert_threshold', 15),
                'loan_reminder_days' => (int) \App\Models\Setting::get('loan_reminder_days', 2),
                'app_name' => 'Inventra',
            ],
            'quote' => fn () => \Illuminate\Support\Str::of(Inspiring::quote())->before(' - ')->toString(),
        ]);
    }
}
