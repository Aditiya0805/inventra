<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStock;
use App\Models\Building;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'building_id' => $request->integer('building_id') ?: null,
            'type' => $request->string('type')->toString(),
            'status' => $request->string('status')->toString(),
        ];

        $rooms = Room::query()
            ->with(['building', 'responsible:id,name', 'bookings' => fn ($q) => $q
                ->whereIn('status', ['disetujui', 'menunggu'])
                ->where('ends_at', '>=', now())
                ->orderBy('starts_at')])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', "%{$v}%")
                ->orWhere('code', 'like', "%{$v}%")))
            ->when($filters['building_id'], fn ($q, $v) => $q->where('building_id', $v))
            ->when($filters['type'], fn ($q, $v) => $q->where('type', $v))
            ->orderBy('building_id')
            ->orderBy('floor')
            ->orderBy('name')
            ->get();

        $seatByRoom = $this->seatSummaryByRoom($rooms->pluck('id'));
        $assetQtyByRoom = $this->assetQtyByRoom($rooms->pluck('id'));

        $rooms = $rooms->map(function (Room $room) use ($seatByRoom, $assetQtyByRoom) {
            $status = $room->displayStatus();
            $seat = $seatByRoom[$room->id] ?? null;

            return [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
                'type' => $room->type,
                'type_label' => $room->typeLabel(),
                'building_id' => $room->building_id,
                'building' => $room->building?->name,
                'floor' => $room->floor,
                'capacity' => $room->capacity,
                'status' => $status,
                'responsible' => $room->responsible?->name,
                'asset_count' => $assetQtyByRoom[$room->id]['assets'] ?? 0,
                'asset_qty' => $assetQtyByRoom[$room->id]['qty'] ?? 0,
                'damaged' => $assetQtyByRoom[$room->id]['damaged'] ?? 0,
                'seats' => $seat ? [
                    'total' => $seat->total_qty,
                    'dipakai' => $seat->used,
                    'tersedia' => $seat->available,
                    'rusak' => $seat->damaged,
                ] : null,
                'next_booking' => $room->bookings->first() ? [
                    'title' => $room->bookings->first()->title,
                    'starts_at' => $room->bookings->first()->starts_at,
                ] : null,
            ];
        });

        if ($filters['status']) {
            $rooms = $rooms->where('status', $filters['status'])->values();
        }

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'filters' => $filters,
            'stats' => [
                'total' => $rooms->count(),
                'available' => $rooms->where('status', 'tersedia')->count(),
                'in_use' => $rooms->whereIn('status', ['dipakai', 'dipesan'])->count(),
                'maintenance' => $rooms->whereIn('status', ['perawatan', 'ditutup'])->count(),
            ],
            'buildings' => Building::orderBy('name')->get(['id', 'name']),
            'types' => Room::TYPES,
            'statuses' => [
                'tersedia' => 'Tersedia',
                'dipakai' => 'Sedang Dipakai',
                'dipesan' => 'Dipesan',
                'perawatan' => 'Perawatan',
                'ditutup' => 'Ditutup',
            ],
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rooms/Form', [
            'room' => null,
            'buildings' => Building::orderBy('name')->get(['id', 'name', 'floors_count']),
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
            'types' => Room::TYPES,
            'nextCode' => 'R-'.str_pad((string) (Room::max('id') + 1), 3, '0', STR_PAD_LEFT),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $room = Room::create($data);

        AuditLogger::log('created', 'ruangan', $room->id, "Menambahkan ruangan {$room->name}", null, $data);

        return redirect()->route('rooms.show', $room)->with('success', 'Ruangan berhasil ditambahkan.');
    }

    public function show(Room $room): Response
    {
        $room->load(['building', 'responsible:id,name,email']);
        $assets = Asset::with(['category', 'stock'])
            ->where('room_id', $room->id)
            ->orderBy('name')
            ->get();

        $summary = ['total' => 0, 'tersedia' => 0, 'dipakai' => 0, 'rusak' => 0, 'perbaikan' => 0, 'hilang' => 0];
        $byCategory = [];

        foreach ($assets as $asset) {
            $qty = $asset->quantitySummary();
            foreach ($qty as $key => $value) {
                $summary[$key] += $value;
            }

            $catId = $asset->category_id;
            if (! isset($byCategory[$catId])) {
                $byCategory[$catId] = [
                    'name' => $asset->category?->name,
                    'color' => $asset->category?->color,
                    'total' => 0,
                    'rusak' => 0,
                ];
            }
            $byCategory[$catId]['total'] += $qty['total'];
            $byCategory[$catId]['rusak'] += $qty['rusak'];
        }

        $bookings = RoomBooking::with('user:id,name')
            ->where('room_id', $room->id)
            ->where('ends_at', '>=', now())
            ->whereIn('status', ['disetujui', 'menunggu'])
            ->orderBy('starts_at')
            ->limit(6)
            ->get();

        $tickets = $room->tickets()
            ->with(['asset:id,code,name', 'reporter:id,name'])
            ->latest()
            ->limit(5)
            ->get();

        $mutations = $room->hasMany(\App\Models\AssetMutation::class, 'to_room_id')
            ->with(['asset:id,code,name', 'fromRoom:id,name', 'mover:id,name'])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Rooms/Show', [
            'room' => [
                ...$room->toArray(),
                'type_label' => $room->typeLabel(),
                'display_status' => $room->displayStatus(),
                'status_label' => $room->displayStatusLabel(),
            ],
            'assets' => $assets,
            'summary' => $summary,
            'byCategory' => array_values($byCategory),
            'bookings' => $bookings,
            'tickets' => $tickets,
            'mutations' => $mutations,
            'categories' => AssetCategory::orderBy('name')->get(['id', 'name', 'tracking_type']),
            'qrUrl' => route('rooms.qr', $room),
        ]);
    }

    public function edit(Room $room): Response
    {
        return Inertia::render('Rooms/Form', [
            'room' => $room,
            'buildings' => Building::orderBy('name')->get(['id', 'name', 'floors_count']),
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
            'types' => Room::TYPES,
            'nextCode' => null,
        ]);
    }

    public function qr(Room $room): \Illuminate\Http\Response
    {
        $builder = new \Endroid\QrCode\Builder\Builder(
            writer: new \Endroid\QrCode\Writer\SvgWriter,
            writerOptions: [\Endroid\QrCode\Writer\SvgWriter::WRITER_OPTION_EXCLUDE_XML_DECLARATION => true],
            data: route('rooms.show', $room),
            encoding: new \Endroid\QrCode\Encoding\Encoding('UTF-8'),
            size: 320,
            margin: 0,
        );

        $result = $builder->build();

        return response($result->getString(), 200, [
            'Content-Type' => $result->getMimeType(),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function update(Request $request, Room $room): RedirectResponse
    {
        $data = $this->validated($request, $room);
        $old = $room->only(array_keys($data));
        $room->update($data);

        AuditLogger::log('updated', 'ruangan', $room->id, "Memperbarui ruangan {$room->name}", $old, $data);

        return redirect()->route('rooms.show', $room)->with('success', 'Ruangan berhasil diperbarui.');
    }

    public function destroy(Room $room): RedirectResponse
    {
        if ($room->assets()->exists()) {
            return back()->with('error', 'Ruangan masih memiliki aset. Pindahkan aset terlebih dahulu sebelum menghapus ruangan.');
        }

        $name = $room->name;
        $room->delete();
        AuditLogger::log('deleted', 'ruangan', $room->id, "Menghapus ruangan {$name}");

        return redirect()->route('rooms.index')->with('success', 'Ruangan berhasil dihapus.');
    }

    private function validated(Request $request, ?Room $room = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:40', Rule::unique('rooms', 'code')->ignore($room?->id)],
            'building_id' => ['required', 'exists:buildings,id'],
            'type' => ['required', Rule::in(array_keys(Room::TYPES))],
            'floor' => ['required', 'integer', 'min:1', 'max:20'],
            'capacity' => ['required', 'integer', 'min:0', 'max:5000'],
            'status' => ['required', Rule::in(array_keys(Room::STATUSES))],
            'responsible_user_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int>  $roomIds
     * @return \Illuminate\Support\Collection<int, object>
     */
    private function seatSummaryByRoom($roomIds)
    {
        return AssetStock::query()
            ->join('assets', 'assets.id', '=', 'asset_stocks.asset_id')
            ->join('asset_categories', 'asset_categories.id', '=', 'assets.category_id')
            ->where('asset_categories.slug', 'kursi')
            ->whereIn('asset_stocks.room_id', $roomIds)
            ->whereNull('assets.deleted_at')
            ->selectRaw('asset_stocks.room_id,
                SUM(asset_stocks.qty_in_use + asset_stocks.qty_available + asset_stocks.qty_damaged + asset_stocks.qty_repair + asset_stocks.qty_lost) as total_qty,
                SUM(asset_stocks.qty_in_use) as used,
                SUM(asset_stocks.qty_available) as available,
                SUM(asset_stocks.qty_damaged) as damaged')
            ->groupBy('asset_stocks.room_id')
            ->get()
            ->keyBy('room_id');
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int>  $roomIds
     */
    private function assetQtyByRoom($roomIds): array
    {
        $result = [];
        foreach ($roomIds as $id) {
            $result[$id] = ['assets' => 0, 'qty' => 0, 'damaged' => 0];
        }

        Asset::with(['stock', 'category'])->whereIn('room_id', $roomIds)->get()
            ->each(function (Asset $asset) use (&$result) {
                $q = $asset->quantitySummary();
                $result[$asset->room_id]['assets']++;
                $result[$asset->room_id]['qty'] += $q['total'];
                $result[$asset->room_id]['damaged'] += $q['rusak'];
            });

        return $result;
    }
}
