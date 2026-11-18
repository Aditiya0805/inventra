<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Room;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    public function index(): Response
    {
        $opnames = StockOpname::with(['room:id,name', 'user:id,name'])
            ->withCount('items')
            ->latest('date')
            ->paginate(12)
            ->through(fn (StockOpname $opname) => [
                ...$opname->toArray(),
                'difference' => $opname->differenceTotal(),
            ]);

        return Inertia::render('Opnames/Index', [
            'opnames' => $opnames,
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'building_id']),
            'stats' => [
                'total' => StockOpname::count(),
                'draft' => StockOpname::where('status', 'draft')->count(),
                'done_month' => StockOpname::where('status', 'selesai')->whereMonth('date', now()->month)->whereYear('date', now()->year)->count(),
                'difference_month' => (int) StockOpnameItem::whereHas('opname', fn ($q) => $q->where('status', 'selesai')->whereMonth('date', now()->month)->whereYear('date', now()->year))->sum('difference'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $room = Room::findOrFail($data['room_id']);
        $assets = Asset::with('stock')
            ->where('room_id', $room->id)
            ->where('status', '!=', 'dihapuskan')
            ->get();

        if ($assets->isEmpty()) {
            return back()->with('error', 'Ruangan ini belum memiliki aset untuk dihitung.');
        }

        $opname = DB::transaction(function () use ($data, $room, $assets, $request) {
            $opname = StockOpname::create([
                'code' => StockOpname::generateCode(),
                'room_id' => $room->id,
                'user_id' => $request->user()->id,
                'date' => $data['date'],
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($assets as $asset) {
                $systemQty = $asset->isBulk() ? ($asset->stock?->total ?? 0) : 1;
                StockOpnameItem::create([
                    'stock_opname_id' => $opname->id,
                    'asset_id' => $asset->id,
                    'system_qty' => $systemQty,
                    'counted_qty' => $systemQty,
                    'difference' => 0,
                ]);
            }

            return $opname;
        });

        AuditLogger::log('created', 'stock_opname', $opname->id, "Memulai stock opname {$opname->code} di {$room->name}");

        return redirect()->route('opnames.show', $opname)->with('success', 'Sesi stock opname dibuat. Masukkan hasil hitung fisik.');
    }

    public function show(StockOpname $opname): Response
    {
        $opname->load(['room.building', 'user:id,name', 'items.asset.category', 'items.asset.stock']);

        return Inertia::render('Opnames/Show', [
            'opname' => $opname,
            'items' => $opname->items,
            'summary' => [
                'items' => $opname->items->count(),
                'system' => $opname->items->sum('system_qty'),
                'counted' => $opname->items->sum('counted_qty'),
                'difference' => $opname->items->sum('difference'),
                'different_items' => $opname->items->where('difference', '!=', 0)->count(),
            ],
        ]);
    }

    public function update(Request $request, StockOpname $opname): RedirectResponse
    {
        if ($opname->status === 'selesai') {
            return back()->with('error', 'Stock opname yang sudah selesai tidak dapat diubah.');
        }

        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:stock_opname_items,id'],
            'items.*.counted_qty' => ['required', 'integer', 'min:0', 'max:100000'],
            'items.*.note' => ['nullable', 'string', 'max:500'],
            'finalize' => ['boolean'],
        ]);

        DB::transaction(function () use ($data, $opname) {
            foreach ($data['items'] as $row) {
                $item = StockOpnameItem::where('stock_opname_id', $opname->id)->findOrFail($row['id']);
                $item->update([
                    'counted_qty' => $row['counted_qty'],
                    'difference' => $row['counted_qty'] - $item->system_qty,
                    'note' => $row['note'] ?? null,
                ]);
            }

            if (! empty($data['finalize'])) {
                $opname->load('items.asset.stock');

                foreach ($opname->items as $item) {
                    if ($item->difference === 0 || ! $item->asset) {
                        continue;
                    }

                    $asset = $item->asset;
                    if ($asset->isBulk() && $asset->stock) {
                        $asset->stock->update([
                            'qty_available' => max(0, $asset->stock->qty_available + $item->difference),
                        ]);
                    } elseif (! $asset->isBulk()) {
                        if ($item->counted_qty === 0 && $asset->status !== 'dihapuskan') {
                            $asset->update(['status' => 'hilang']);
                        } elseif ($item->counted_qty > 0 && $asset->status === 'hilang') {
                            $asset->update(['status' => 'tersedia']);
                        }
                    }
                }

                $opname->update(['status' => 'selesai']);
            }
        });

        AuditLogger::log('updated', 'stock_opname', $opname->id, "Menyimpan hasil stock opname {$opname->code}".(! empty($data['finalize']) ? ' dan menandai selesai' : ''));

        if (! empty($data['finalize'])) {
            Notifier::send(Notifier::admins(), 'Stock opname selesai', "Stock opname {$opname->code} di {$opname->room?->name} telah diselesaikan.", route('opnames.show', $opname), 'success');
        }

        return back()->with('success', ! empty($data['finalize']) ? 'Stock opname selesai dan selisih telah disesuaikan.' : 'Hasil hitung berhasil disimpan.');
    }

    public function destroy(StockOpname $opname): RedirectResponse
    {
        if ($opname->status === 'selesai') {
            return back()->with('error', 'Stock opname yang sudah selesai tidak dapat dihapus.');
        }

        $code = $opname->code;
        $opname->delete();
        AuditLogger::log('deleted', 'stock_opname', $opname->id, "Menghapus draft stock opname {$code}");

        return redirect()->route('opnames.index')->with('success', 'Draft stock opname dihapus.');
    }
}
