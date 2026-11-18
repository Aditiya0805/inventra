<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetMutation;
use App\Models\Room;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MutationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'room_id' => $request->integer('room_id') ?: null,
        ];

        $mutations = AssetMutation::query()
            ->with(['asset:id,code,name,category_id,room_id', 'asset.category:id,name', 'fromRoom:id,name', 'toRoom:id,name', 'mover:id,name'])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('code', 'like', "%{$v}%")
                ->orWhere('reason', 'like', "%{$v}%")
                ->orWhereHas('asset', fn ($a) => $a->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))))
            ->when($filters['room_id'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('from_room_id', $v)->orWhere('to_room_id', $v)))
            ->latest('moved_at')
            ->paginate(15)
            ->withQueryString();

        $assets = Asset::with(['category:id,name,tracking_type', 'room:id,name', 'stock'])
            ->where('status', '!=', 'dihapuskan')
            ->orderBy('name')
            ->get()
            ->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'code' => $asset->code,
                'name' => $asset->name,
                'category' => $asset->category?->name,
                'is_bulk' => $asset->isBulk(),
                'available' => $asset->isBulk() ? ($asset->stock?->qty_available ?? 0) : 1,
                'room_id' => $asset->room_id,
                'room' => $asset->room?->name,
            ]);

        return Inertia::render('Mutations/Index', [
            'mutations' => $mutations,
            'filters' => $filters,
            'assets' => $assets->filter(fn ($asset) => ! $asset['is_bulk'] || $asset['available'] > 0)->values(),
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'building_id', 'status']),
            'stats' => [
                'total' => AssetMutation::count(),
                'month' => AssetMutation::whereMonth('moved_at', now()->month)->whereYear('moved_at', now()->year)->count(),
                'units' => (int) AssetMutation::whereMonth('moved_at', now()->month)->sum('quantity'),
                'rooms' => AssetMutation::whereMonth('moved_at', now()->month)->distinct('to_room_id')->count('to_room_id'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'asset_id' => ['required', 'exists:assets,id'],
            'to_room_id' => ['required', 'exists:rooms,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'reason' => ['required', 'string', 'max:500'],
            'moved_at' => ['required', 'date'],
        ]);

        $asset = Asset::with(['category', 'stock'])->findOrFail($data['asset_id']);
        $destination = Room::findOrFail($data['to_room_id']);
        $fromRoomId = $asset->room_id;

        if ((int) $fromRoomId === (int) $destination->id) {
            throw ValidationException::withMessages(['to_room_id' => 'Ruangan tujuan harus berbeda dari ruangan asal.']);
        }

        if ($asset->isBulk()) {
            $available = $asset->stock?->qty_available ?? 0;
            if ($data['quantity'] > $available) {
                throw ValidationException::withMessages(['quantity' => "Jumlah tersedia untuk dimutasi hanya {$available} unit."]);
            }
        } elseif ($data['quantity'] !== 1) {
            throw ValidationException::withMessages(['quantity' => 'Aset individual hanya dapat dipindahkan sebanyak 1 unit.']);
        }

        $destinationAsset = null;

        DB::transaction(function () use ($asset, $destination, $data, $fromRoomId, &$destinationAsset) {
            if ($asset->isBulk()) {
                $asset->stock->update(['qty_available' => $asset->stock->qty_available - $data['quantity']]);

                $destinationAsset = Asset::with('stock')
                    ->where('category_id', $asset->category_id)
                    ->where('room_id', $destination->id)
                    ->where('name', $asset->name)
                    ->where('id', '!=', $asset->id)
                    ->first();

                if ($destinationAsset && $destinationAsset->stock) {
                    $destinationAsset->stock->update([
                        'qty_available' => $destinationAsset->stock->qty_available + $data['quantity'],
                    ]);
                } else {
                    $destinationAsset = Asset::create([
                        'code' => Asset::generateCode($asset->category),
                        'name' => $asset->name,
                        'category_id' => $asset->category_id,
                        'room_id' => $destination->id,
                        'brand' => $asset->brand,
                        'model' => $asset->model,
                        'acquisition_date' => $asset->acquisition_date,
                        'value' => $asset->value,
                        'funding_source' => $asset->funding_source,
                        'status' => 'tersedia',
                        'notes' => "Hasil mutasi dari {$asset->code}",
                        'is_consumable' => $asset->is_consumable,
                        'min_stock' => $asset->min_stock,
                    ]);
                    $destinationAsset->stock()->create([
                        'room_id' => $destination->id,
                        'qty_available' => $data['quantity'],
                    ]);
                }
            } else {
                $asset->update(['room_id' => $destination->id]);
            }

            AssetMutation::create([
                'code' => AssetMutation::generateCode(),
                'asset_id' => $asset->id,
                'quantity' => $data['quantity'],
                'from_room_id' => $fromRoomId,
                'to_room_id' => $destination->id,
                'destination_asset_id' => $destinationAsset?->id,
                'reason' => $data['reason'],
                'moved_by' => auth()->id(),
                'moved_at' => $data['moved_at'],
            ]);
        });

        AuditLogger::log('updated', 'mutasi_aset', $asset->id, "Memutasi {$data['quantity']} {$asset->name} dari ruangan {$fromRoomId} ke {$destination->name}");

        Notifier::send(Notifier::admins(), 'Mutasi aset', "{$data['quantity']} unit {$asset->name} dipindahkan ke {$destination->name}.", route('mutations.index'), 'info');

        return back()->with('success', 'Mutasi aset berhasil dicatat. Jumlah pada kedua ruangan telah diperbarui.');
    }
}
