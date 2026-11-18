<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetMutation;
use App\Models\AssetStock;
use App\Models\Building;
use App\Models\DamageTicket;
use App\Models\Loan;
use App\Models\Room;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'category_id' => $request->integer('category_id') ?: null,
            'room_id' => $request->integer('room_id') ?: null,
            'building_id' => $request->integer('building_id') ?: null,
            'status' => $request->string('status')->toString(),
            'tracking' => $request->string('tracking')->toString(),
            'sort' => $request->string('sort', 'name')->toString(),
            'dir' => $request->string('dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc',
        ];

        $query = Asset::query()
            ->with(['category', 'room.building', 'stock'])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', "%{$v}%")
                ->orWhere('code', 'like', "%{$v}%")
                ->orWhere('brand', 'like', "%{$v}%")
                ->orWhere('serial_number', 'like', "%{$v}%")))
            ->when($filters['category_id'], fn ($q, $v) => $q->where('category_id', $v))
            ->when($filters['room_id'], fn ($q, $v) => $q->where('room_id', $v))
            ->when($filters['building_id'], fn ($q, $v) => $q->whereHas('room', fn ($r) => $r->where('building_id', $v)))
            ->when($filters['status'], fn ($q, $v) => $q->where('status', $v))
            ->when($filters['tracking'], fn ($q, $v) => $q->whereHas('category', fn ($c) => $c->where('tracking_type', $v)));

        $sortable = ['name', 'code', 'status', 'value', 'acquisition_date', 'created_at'];
        $query->orderBy(in_array($filters['sort'], $sortable, true) ? $filters['sort'] : 'name', $filters['dir']);

        $summaryAssets = (clone $query)->get();
        $summary = ['total' => 0, 'tersedia' => 0, 'dipakai' => 0, 'rusak' => 0, 'perbaikan' => 0, 'hilang' => 0, 'value' => 0];
        foreach ($summaryAssets as $asset) {
            $qty = $asset->quantitySummary();
            foreach (['total', 'tersedia', 'dipakai', 'rusak', 'perbaikan', 'hilang'] as $key) {
                $summary[$key] += $qty[$key];
            }
            $summary['value'] += (float) $asset->value * max($qty['total'], 1);
        }

        $assets = $query->paginate(15)->withQueryString()->through(fn (Asset $asset) => [
            'id' => $asset->id,
            'code' => $asset->code,
            'name' => $asset->name,
            'category' => $asset->category?->only(['id', 'name', 'color', 'group', 'tracking_type']),
            'room' => $asset->room ? [
                'id' => $asset->room->id,
                'name' => $asset->room->name,
                'building' => $asset->room->building?->name,
            ] : null,
            'status' => $asset->status,
            'status_label' => $asset->statusLabel(),
            'summary' => $asset->quantitySummary(),
            'value' => (float) $asset->value,
            'acquisition_date' => $asset->acquisition_date?->toDateString(),
            'is_consumable' => $asset->is_consumable,
            'min_stock' => $asset->min_stock,
            'low_stock' => $asset->isLowStock(),
            'photo_url' => $asset->photo_url,
            'updated_at' => $asset->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'filters' => $filters,
            'summary' => $summary,
            'categories' => AssetCategory::orderBy('name')->get(['id', 'name', 'tracking_type', 'group']),
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'code', 'building_id']),
            'buildings' => Building::orderBy('name')->get(['id', 'name']),
            'statuses' => Asset::STATUSES,
            'lowStocks' => Asset::with(['category', 'room', 'stock'])
                ->where('is_consumable', true)
                ->get()
                ->filter(fn (Asset $asset) => $asset->isLowStock())
                ->take(5)
                ->values(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Assets/Form', [
            'asset' => null,
            'categories' => AssetCategory::orderBy('name')->get(),
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'code', 'building_id']),
            'statuses' => Asset::STATUSES,
            'selectedCategory' => $request->integer('category_id') ?: null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $category = AssetCategory::findOrFail($data['category_id']);
        $isBulk = $category->isBulk();

        if ($isBulk) {
            $stock = $this->stockInput($request);
            if (array_sum($stock) < 1) {
                throw ValidationException::withMessages(['qty_available' => 'Jumlah aset massal minimal 1 unit.']);
            }
        }

        $data['code'] = $this->uniqueCode($data['code'] ?? null, $category);
        $data['status'] = $isBulk ? 'tersedia' : ($data['status'] ?? 'tersedia');
        $data['value'] = $data['value'] ?? 0;
        $data['is_consumable'] = $data['is_consumable'] ?? false;
        $data['photo'] = $request->hasFile('photo')
            ? $request->file('photo')->store('assets', 'public')
            : null;

        $asset = Asset::create($data);

        if ($isBulk) {
            $asset->stock()->create(['room_id' => $asset->room_id, ...$stock]);
        }

        AuditLogger::log('created', 'aset', $asset->id, "Menambahkan aset {$asset->name} ({$asset->code})", null, $data);

        Notifier::send(Notifier::admins(), 'Aset baru ditambahkan', "{$request->user()->name} menambahkan aset {$asset->name} ({$asset->code}).", route('assets.show', $asset), 'success');

        return redirect()->route('assets.show', $asset)->with('success', 'Aset berhasil ditambahkan.');
    }

    public function show(Asset $asset): Response
    {
        $asset->load(['category', 'room.building', 'stock']);

        $mutations = AssetMutation::with(['fromRoom:id,name', 'toRoom:id,name', 'mover:id,name'])
            ->where(fn ($q) => $q->where('asset_id', $asset->id)->orWhere('destination_asset_id', $asset->id))
            ->latest('moved_at')
            ->limit(8)
            ->get();

        $loans = Loan::with('borrower:id,name')
            ->where('asset_id', $asset->id)
            ->latest()
            ->limit(6)
            ->get();

        $tickets = DamageTicket::with(['reporter:id,name', 'technician:id,name'])
            ->where('asset_id', $asset->id)
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('Assets/Show', [
            'asset' => [
                ...$asset->toArray(),
                'status_label' => $asset->statusLabel(),
                'status_color' => $asset->statusColor(),
                'summary' => $asset->quantitySummary(),
                'low_stock' => $asset->isLowStock(),
                'photo_url' => $asset->photo_url,
                'is_bulk' => $asset->isBulk(),
            ],
            'qrUrl' => route('assets.qr', $asset),
            'mutations' => $mutations,
            'loans' => $loans,
            'tickets' => $tickets,
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'building_id']),
            'statuses' => Asset::STATUSES,
        ]);
    }

    public function edit(Asset $asset): Response
    {
        return Inertia::render('Assets/Form', [
            'asset' => [
                ...$asset->load(['category', 'stock'])->toArray(),
                'photo_url' => $asset->photo_url,
            ],
            'categories' => AssetCategory::orderBy('name')->get(),
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'code', 'building_id']),
            'statuses' => Asset::STATUSES,
            'selectedCategory' => $asset->category_id,
        ]);
    }

    public function update(Request $request, Asset $asset): RedirectResponse
    {
        $data = $this->validated($request, $asset);
        $old = $asset->only(['name', 'category_id', 'room_id', 'brand', 'model', 'serial_number', 'acquisition_date', 'value', 'funding_source', 'status', 'is_consumable', 'min_stock']);

        $data['value'] = $data['value'] ?? 0;
        $data['is_consumable'] = $data['is_consumable'] ?? false;

        if ($request->hasFile('photo')) {
            if ($asset->photo) {
                Storage::disk('public')->delete($asset->photo);
            }
            $data['photo'] = $request->file('photo')->store('assets', 'public');
        } else {
            unset($data['photo']);
        }

        if ($asset->isBulk()) {
            $data['status'] = 'tersedia';
            if ($asset->stock && $asset->room_id !== (int) $data['room_id']) {
                $asset->stock->update(['room_id' => $data['room_id']]);
            }
        }

        $asset->update($data);

        AuditLogger::log('updated', 'aset', $asset->id, "Memperbarui aset {$asset->name} ({$asset->code})", $old, $data);

        return redirect()->route('assets.show', $asset)->with('success', 'Aset berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Asset $asset): RedirectResponse
    {
        if ($asset->isBulk()) {
            return back()->with('error', 'Status aset massal diubah melalui jumlah per status.');
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Asset::STATUSES))],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $old = $asset->status;
        $asset->update(['status' => $data['status']]);

        AuditLogger::log('status', 'aset', $asset->id, "Mengubah status aset {$asset->code} dari {$old} menjadi {$data['status']}", ['status' => $old], ['status' => $data['status']]);

        return back()->with('success', 'Status aset berhasil diperbarui.');
    }

    public function updateStock(Request $request, Asset $asset): RedirectResponse
    {
        if (! $asset->isBulk()) {
            return back()->with('error', 'Aset ini bukan aset massal.');
        }

        $data = $request->validate([
            'qty_available' => ['required', 'integer', 'min:0'],
            'qty_in_use' => ['required', 'integer', 'min:0'],
            'qty_damaged' => ['required', 'integer', 'min:0'],
            'qty_repair' => ['required', 'integer', 'min:0'],
            'qty_lost' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $stock = $asset->stock;
        $newTotal = $data['qty_available'] + $data['qty_in_use'] + $data['qty_damaged'] + $data['qty_repair'] + $data['qty_lost'];

        if ($stock && $newTotal !== $stock->total) {
            throw ValidationException::withMessages([
                'qty_available' => "Total jumlah harus tetap {$stock->total} unit. Gunakan fitur mutasi untuk memindahkan atau menambah aset secara resmi.",
            ]);
        }

        $old = $stock?->only(['qty_available', 'qty_in_use', 'qty_damaged', 'qty_repair', 'qty_lost']);

        if ($stock) {
            $stock->update([
                'qty_available' => $data['qty_available'],
                'qty_in_use' => $data['qty_in_use'],
                'qty_damaged' => $data['qty_damaged'],
                'qty_repair' => $data['qty_repair'],
                'qty_lost' => $data['qty_lost'],
            ]);
        } else {
            $asset->stock()->create(['room_id' => $asset->room_id, ...array_diff_key($data, ['note' => true])]);
        }

        AuditLogger::log('updated', 'stok_aset', $asset->id, "Memperbarui jumlah aset massal {$asset->name}".($data['note'] ? " — {$data['note']}" : ''), $old, $data);

        return back()->with('success', 'Jumlah aset berhasil diperbarui.');
    }

    public function destroy(Request $request, Asset $asset): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $old = $asset->status;
        $asset->update([
            'status' => 'dihapuskan',
            'disposal_reason' => $data['reason'],
            'disposed_at' => now(),
        ]);

        AuditLogger::log('deleted', 'aset', $asset->id, "Menghapus aset {$asset->name} ({$asset->code}): {$data['reason']}", ['status' => $old], ['status' => 'dihapuskan']);

        Notifier::send(Notifier::admins(), 'Aset dihapuskan', "Aset {$asset->name} ({$asset->code}) telah dihapuskan oleh {$request->user()->name}.", route('assets.show', $asset), 'warning');

        return redirect()->route('assets.index')->with('success', 'Aset berhasil dihapuskan dari daftar aktif.');
    }

    public function restore(Asset $asset): RedirectResponse
    {
        $asset->update(['status' => 'tersedia', 'disposal_reason' => null, 'disposed_at' => null]);
        AuditLogger::log('status', 'aset', $asset->id, "Memulihkan aset {$asset->code}");

        return back()->with('success', 'Aset berhasil dipulihkan.');
    }

    public function qr(Asset $asset): \Illuminate\Http\Response
    {
        $builder = new Builder(
            writer: new SvgWriter,
            writerOptions: [SvgWriter::WRITER_OPTION_EXCLUDE_XML_DECLARATION => true],
            data: route('assets.show', $asset),
            encoding: new Encoding('UTF-8'),
            size: 320,
            margin: 0,
        );

        $result = $builder->build();

        return response($result->getString(), 200, [
            'Content-Type' => $result->getMimeType(),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function labels(Request $request): \Illuminate\View\View
    {
        $assets = Asset::with(['category', 'room.building'])
            ->when($request->filled('ids'), fn ($q) => $q->whereIn('id', explode(',', $request->string('ids')->toString())))
            ->when($request->integer('room_id'), fn ($q, $v) => $q->where('room_id', $v))
            ->when($request->integer('category_id'), fn ($q, $v) => $q->where('category_id', $v))
            ->when(! $request->filled('ids') && ! $request->filled('room_id') && ! $request->filled('category_id'), fn ($q) => $q->whereIn('id', Asset::query()->latest()->limit(12)->pluck('id')))
            ->orderBy('name')
            ->get();

        return view('assets.labels', [
            'assets' => $assets,
            'schoolName' => \App\Models\Setting::get('school_name', 'SMP Negeri 1 Nusantara'),
        ]);
    }

    public function scan(): Response
    {
        return Inertia::render('Assets/Scan', [
            'recent' => Asset::with('room:id,name')->latest()->limit(6)->get(['id', 'code', 'name', 'room_id', 'status']),
        ]);
    }

    public function lookup(Request $request): JsonResponse
    {
        $term = trim($request->string('code')->toString());

        if ($term === '') {
            return response()->json(['matches' => []]);
        }

        $matches = Asset::with(['room:id,name', 'category:id,name'])
            ->where('code', $term)
            ->orWhere('code', 'like', "%{$term}%")
            ->orWhere('name', 'like', "%{$term}%")
            ->limit(8)
            ->get()
            ->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'code' => $asset->code,
                'name' => $asset->name,
                'category' => $asset->category?->name,
                'room' => $asset->room?->name,
                'status' => $asset->statusLabel(),
                'url' => route('assets.show', $asset),
            ]);

        return response()->json(['matches' => $matches]);
    }

    private function validated(Request $request, ?Asset $asset = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:60', Rule::unique('assets', 'code')->ignore($asset?->id)],
            'category_id' => ['required', 'exists:asset_categories,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'acquisition_date' => ['nullable', 'date'],
            'value' => ['nullable', 'numeric', 'min:0', 'max:999999999999'],
            'funding_source' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(array_keys(Asset::STATUSES))],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_consumable' => ['boolean'],
            'min_stock' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ], [], [
            'category_id' => 'kategori',
            'room_id' => 'ruangan',
            'acquisition_date' => 'tanggal perolehan',
        ]);
    }

    private function stockInput(Request $request): array
    {
        $data = $request->validate([
            'qty_available' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'qty_in_use' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'qty_damaged' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'qty_repair' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'qty_lost' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ]);

        return [
            'qty_available' => (int) ($data['qty_available'] ?? 0),
            'qty_in_use' => (int) ($data['qty_in_use'] ?? 0),
            'qty_damaged' => (int) ($data['qty_damaged'] ?? 0),
            'qty_repair' => (int) ($data['qty_repair'] ?? 0),
            'qty_lost' => (int) ($data['qty_lost'] ?? 0),
        ];
    }

    private function uniqueCode(?string $provided, AssetCategory $category): string
    {
        if ($provided && ! Asset::withTrashed()->where('code', $provided)->exists()) {
            return $provided;
        }

        $attempts = 0;
        do {
            $code = Asset::generateCode($category);
            $attempts++;
        } while (Asset::withTrashed()->where('code', $code)->exists() && $attempts < 50);

        return $code;
    }
}
