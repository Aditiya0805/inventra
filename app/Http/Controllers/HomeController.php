<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Building;
use App\Models\Room;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $schoolSettings = [
            'name' => Setting::get('school_name', 'MA Muhammadiyah Bandar Lampung'),
            'address' => Setting::get('school_address', 'Jl. Pulau Sangiang RT 07 LK II, Sukarame, Kota Bandar Lampung, Lampung 35131'),
            'npsn' => Setting::get('npsn', '10648361'),
            'nsm' => '131218710003',
            'accreditation' => 'B',
            'foundation' => 'Majelis Dikdasmen Pimpinan Wilayah Muhammadiyah Lampung',
            'headmaster' => Setting::get('headmaster', 'Hadi Sururudin, S.Pd.I., M.Pd.'),
            'academic_year' => Setting::get('academic_year', '2026/2027'),
            'phone' => Setting::get('school_phone', '0852-2885-9634'),
            'email' => Setting::get('school_email', 'info@mambalam.sch.id'),
            'website' => 'https://www.mambalam.sch.id/',
            'socials' => [
                'instagram' => 'https://instagram.com/ma_muhammadiyah_sukarame',
                'facebook' => 'https://facebook.com/adminmamsa',
                'youtube' => 'https://youtube.com/@mamsabalam',
            ],
        ];

        $buildings = Building::with(['rooms' => fn ($q) => $q->orderBy('floor')->orderBy('name')])
            ->orderBy('code')
            ->get();

        $totalAssets = Asset::count();
        $availableAssets = Asset::where('status', 'tersedia')->count();

        $stats = [
            'buildings_count' => Building::count(),
            'rooms_count' => Room::count(),
            'total_assets' => $totalAssets,
            'ready_percentage' => $totalAssets > 0 ? (int) round(($availableAssets / $totalAssets) * 100) : 100,
        ];

        return Inertia::render('Home', [
            'school' => $schoolSettings,
            'buildings' => $buildings,
            'stats' => $stats,
        ]);
    }
}
