<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Models\Building;
use App\Models\Setting;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request): Response
    {
        $defaults = [
            'school_name' => 'MA Muhammadiyah Bandar Lampung',
            'school_address' => 'Jl. Pulau Sangiang RT 07 LK II, Sukarame, Kota Bandar Lampung, Lampung 35131',
            'npsn' => '10648361',
            'headmaster' => 'Hadi Sururudin, S.Pd.I., M.Pd.',
            'academic_year' => '2026/2027',
            'alert_threshold' => '15',
            'loan_reminder_days' => '2',
            'email_notifications' => '1',
            'school_phone' => '0852-2885-9634',
            'school_email' => 'info@mambalam.sch.id',
        ];

        return Inertia::render('Settings/Index', [
            'tab' => $request->string('tab', 'sekolah')->toString(),
            'settings' => array_merge($defaults, Setting::allSettings()),
            'users' => User::orderBy('name')->get(['id', 'name', 'email', 'role', 'phone', 'job_title', 'is_active', 'last_login_at']),
            'buildings' => Building::withCount('rooms')->orderBy('name')->get(),
            'categories' => AssetCategory::withCount('assets')->orderBy('name')->get(),
            'roles' => User::ROLES,
            'groups' => AssetCategory::GROUPS,
            'trackingTypes' => AssetCategory::TRACKING_TYPES,
            'stats' => [
                'users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'buildings' => Building::count(),
                'rooms' => \App\Models\Room::count(),
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'school_name' => ['required', 'string', 'max:150'],
            'school_address' => ['required', 'string', 'max:255'],
            'npsn' => ['nullable', 'string', 'max:30'],
            'headmaster' => ['nullable', 'string', 'max:120'],
            'academic_year' => ['required', 'string', 'max:20'],
            'school_phone' => ['nullable', 'string', 'max:30'],
            'school_email' => ['nullable', 'email', 'max:120'],
        ]);

        foreach ($data as $key => $value) {
            Setting::put($key, $value, 'sekolah');
        }

        AuditLogger::log('updated', 'pengaturan', null, 'Memperbarui profil sekolah', null, $data);

        return back()->with('success', 'Profil sekolah berhasil disimpan.');
    }

    public function updateAlerts(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'alert_threshold' => ['required', 'integer', 'min:1', 'max:100'],
            'loan_reminder_days' => ['required', 'integer', 'min:0', 'max:30'],
            'email_notifications' => ['boolean'],
        ]);

        foreach ($data as $key => $value) {
            Setting::put($key, (string) $value, 'peringatan');
        }

        AuditLogger::log('updated', 'pengaturan', null, 'Memperbarui ambang peringatan dan notifikasi', null, $data);

        return back()->with('success', 'Pengaturan peringatan berhasil disimpan.');
    }
}
