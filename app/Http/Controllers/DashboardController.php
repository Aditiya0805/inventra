<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStock;
use App\Models\Building;
use App\Models\DamageTicket;
use App\Models\Loan;
use App\Models\Room;
use App\Models\RoomBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = [
            'building_id' => $request->integer('building_id') ?: null,
            'floor' => $request->integer('floor') ?: null,
            'room_id' => $request->integer('room_id') ?: null,
            'category_id' => $request->integer('category_id') ?: null,
        ];

        $rooms = Room::query()
            ->with(['building', 'bookings' => fn ($q) => $q
                ->whereIn('status', ['disetujui', 'menunggu'])
                ->where('ends_at', '>=', now())
                ->orderBy('starts_at')])
            ->when($filters['building_id'], fn ($q, $v) => $q->where('building_id', $v))
            ->when($filters['floor'], fn ($q, $v) => $q->where('floor', $v))
            ->when($filters['room_id'], fn ($q, $v) => $q->where('id', $v))
            ->get();

        $roomIds = $rooms->pluck('id');

        $assets = Asset::query()
            ->with(['category', 'room.building', 'stock'])
            ->when($filters['room_id'], fn ($q, $v) => $q->where('room_id', $v))
            ->when(! $filters['room_id'] && ($filters['building_id'] || $filters['floor']), fn ($q) => $q->whereIn('room_id', $roomIds))
            ->when($filters['category_id'], fn ($q, $v) => $q->where('category_id', $v))
            ->get();

        $totals = ['total' => 0, 'tersedia' => 0, 'dipakai' => 0, 'rusak' => 0, 'perbaikan' => 0, 'hilang' => 0];
        foreach ($assets as $asset) {
            foreach ($asset->quantitySummary() as $key => $value) {
                $totals[$key] += $value;
            }
        }

        $roomStatusCounts = ['tersedia' => 0, 'dipakai' => 0, 'dipesan' => 0, 'perawatan' => 0, 'ditutup' => 0];
        $roomsData = $rooms->map(function (Room $room) use ($assets, &$roomStatusCounts) {
            $status = $room->displayStatus();
            $roomStatusCounts[$status] = ($roomStatusCounts[$status] ?? 0) + 1;

            $roomAssets = $assets->where('room_id', $room->id);
            $qty = ['total' => 0, 'rusak' => 0];
            foreach ($roomAssets as $asset) {
                $summary = $asset->quantitySummary();
                $qty['total'] += $summary['total'];
                $qty['rusak'] += $summary['rusak'];
            }

            return [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
                'type' => $room->typeLabel(),
                'building' => $room->building?->name,
                'floor' => $room->floor,
                'status' => $status,
                'asset_count' => $roomAssets->count(),
                'asset_qty' => $qty['total'],
                'damaged' => $qty['rusak'],
            ];
        })->values();

        $seatAssets = $assets->filter(fn (Asset $asset) => $asset->category?->slug === 'kursi');
        $seats = ['total' => 0, 'dipakai' => 0, 'tersedia' => 0, 'rusak' => 0, 'perbaikan' => 0, 'hilang' => 0];
        foreach ($seatAssets as $asset) {
            foreach ($asset->quantitySummary() as $key => $value) {
                $seats[$key] += $value;
            }
        }

        $deviceGroups = $assets
            ->filter(fn (Asset $asset) => $asset->category?->group === 'perangkat')
            ->groupBy(fn (Asset $asset) => $asset->category_id)
            ->map(function ($group) {
                $category = $group->first()->category;
                $summary = ['total' => 0, 'tersedia' => 0, 'dipakai' => 0, 'rusak' => 0, 'perbaikan' => 0];

                foreach ($group as $asset) {
                    $q = $asset->quantitySummary();
                    $summary['total'] += $q['total'];
                    $summary['tersedia'] += $q['tersedia'];
                    $summary['dipakai'] += $q['dipakai'];
                    $summary['rusak'] += $q['rusak'];
                    $summary['perbaikan'] += $q['perbaikan'];
                }

                return [
                    'name' => $category?->name,
                    'color' => $category?->color,
                    ...$summary,
                ];
            })
            ->values();

        $categoryChart = $assets
            ->groupBy('category_id')
            ->map(function ($group) {
                $category = $group->first()->category;
                $qty = 0;
                $damaged = 0;
                foreach ($group as $asset) {
                    $q = $asset->quantitySummary();
                    $qty += $q['total'];
                    $damaged += $q['rusak'];
                }

                return [
                    'name' => $category?->name ?? 'Tanpa Kategori',
                    'total' => $qty,
                    'rusak' => $damaged,
                    'color' => $category?->color ?? 'slate',
                ];
            })
            ->sortByDesc('total')
            ->take(8)
            ->values();

        $threshold = (int) \App\Models\Setting::get('alert_threshold', 15);
        $alerts = $roomsData
            ->filter(fn ($room) => $room['asset_qty'] > 0 && ($room['damaged'] / max($room['asset_qty'], 1)) * 100 > $threshold)
            ->map(fn ($room) => [
                ...$room,
                'percentage' => round(($room['damaged'] / max($room['asset_qty'], 1)) * 100, 1),
            ])
            ->sortByDesc('percentage')
            ->take(4)
            ->values();

        $recentTickets = DamageTicket::query()
            ->with(['asset:id,code,name', 'room:id,name', 'reporter:id,name'])
            ->latest()
            ->limit(6)
            ->get();

        $dueLoans = Loan::query()
            ->with(['asset:id,code,name', 'borrower:id,name'])
            ->whereIn('status', ['disetujui', 'dipinjam'])
            ->whereDate('due_date', '<=', now()->addDays(7))
            ->orderBy('due_date')
            ->limit(5)
            ->get()
            ->map(fn (Loan $loan) => [
                ...$loan->toArray(),
                'is_overdue' => $loan->isOverdue(),
                'days_left' => (int) now()->startOfDay()->diffInDays($loan->due_date->startOfDay(), false),
            ]);

        $lowStocks = $assets
            ->filter(fn (Asset $asset) => $asset->isLowStock())
            ->take(4)
            ->map(fn (Asset $asset) => [
                ...$asset->toArray(),
                'summary' => $asset->quantitySummary(),
                'photo_url' => $asset->photo_url,
                'low_stock' => true,
            ])
            ->values();

        $todayBookings = RoomBooking::query()
            ->with(['room:id,name,code', 'user:id,name'])
            ->whereIn('status', ['disetujui', 'menunggu'])
            ->whereDate('starts_at', today())
            ->orderBy('starts_at')
            ->get();

        $buildings = Building::orderBy('name')->get(['id', 'name']);
        $availableRooms = Room::orderBy('name')->get(['id', 'name', 'building_id', 'floor']);

        $user = $request->user();
        $isTechnicianOrSuperAdmin = $user && in_array($user->role, ['super_admin', 'teknisi'], true);

        $pendingDamageReports = $isTechnicianOrSuperAdmin
            ? DamageTicket::query()
                ->with(['asset:id,code,name', 'room:id,name', 'reporter:id,name'])
                ->where('status', 'dilaporkan')
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (DamageTicket $t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'description' => $t->description,
                    'urgency' => $t->urgency,
                    'urgency_label' => DamageTicket::URGENCIES[$t->urgency] ?? $t->urgency,
                    'asset_name' => $t->asset?->name,
                    'room_name' => $t->room?->name,
                    'reporter_name' => $t->reporter?->name ?? 'Pengguna',
                    'created_at' => $t->created_at->toISOString(),
                    'created_at_human' => $t->created_at->diffForHumans(),
                ])
            : collect();

        return Inertia::render('Dashboard', [
            'kpi' => [
                'rooms' => $rooms->count(),
                'rooms_in_use' => $roomStatusCounts['dipakai'],
                'rooms_available' => $roomStatusCounts['tersedia'],
                'total_assets' => $totals['total'],
                'damaged' => $totals['rusak'],
                'in_repair' => $totals['perbaikan'],
                'available_assets' => $totals['tersedia'],
                'open_tickets' => DamageTicket::whereIn('status', ['dilaporkan', 'diverifikasi', 'dalam_perbaikan'])->count(),
                'active_loans' => Loan::whereIn('status', ['disetujui', 'dipinjam'])->count(),
                'overdue_loans' => Loan::whereIn('status', ['disetujui', 'dipinjam'])->whereDate('due_date', '<', today())->count(),
            ],
            'seats' => $seats,
            'devices' => $deviceGroups,
            'roomStatus' => $roomStatusCounts,
            'rooms' => $roomsData->take(8),
            'categoryChart' => $categoryChart,
            'alerts' => $alerts,
            'recentTickets' => $recentTickets,
            'dueLoans' => $dueLoans,
            'lowStocks' => $lowStocks,
            'todayBookings' => $todayBookings,
            'pendingDamageReports' => $pendingDamageReports,
            'canViewDamageAlerts' => $isTechnicianOrSuperAdmin,
            'filters' => $filters,
            'filterOptions' => [
                'buildings' => $buildings,
                'rooms' => $availableRooms,
                'categories' => AssetCategory::orderBy('name')->get(['id', 'name']),
                'floors' => [1, 2, 3, 4],
            ],
            'threshold' => $threshold,
            'today' => Carbon::now()->translatedFormat('l, d F Y'),
        ]);
    }
}
