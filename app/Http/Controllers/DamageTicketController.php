<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\DamageTicket;
use App\Models\Room;
use App\Models\User;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DamageTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'status' => $request->string('status')->toString(),
            'urgency' => $request->string('urgency')->toString(),
            'mine' => $request->boolean('mine'),
            'technician' => $request->boolean('technician'),
        ];

        $query = DamageTicket::query()
            ->with([
                'asset:id,code,name,category_id,room_id',
                'asset.category:id,name',
                'room:id,name',
                'reporter:id,name',
                'technician:id,name',
            ])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('code', 'like', "%{$v}%")
                ->orWhere('title', 'like', "%{$v}%")
                ->orWhere('description', 'like', "%{$v}%")
                ->orWhereHas('asset', fn ($a) => $a->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))))
            ->when($filters['status'], fn ($q, $v) => $q->where('status', $v))
            ->when($filters['urgency'], fn ($q, $v) => $q->where('urgency', $v))
            ->when($filters['mine'], fn ($q) => $q->where('reporter_id', $request->user()->id))
            ->when($filters['technician'], fn ($q) => $q->where('technician_id', $request->user()->id))
            ->latest();

        $tickets = (clone $query)->limit(200)->get();

        $counts = DamageTicket::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $filters,
            'counts' => $counts,
            'statuses' => DamageTicket::STATUSES,
            'urgencies' => DamageTicket::URGENCIES,
            'assets' => Asset::with(['category:id,name', 'room:id,name'])
                ->where('status', '!=', 'dihapuskan')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'category_id', 'room_id', 'status']),
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'building_id']),
            'technicians' => User::where('role', 'teknisi')->where('is_active', true)->get(['id', 'name']),
            'stats' => [
                'open' => DamageTicket::whereIn('status', ['dilaporkan', 'diverifikasi', 'dalam_perbaikan'])->count(),
                'urgent' => DamageTicket::where('urgency', 'tinggi')->whereIn('status', ['dilaporkan', 'diverifikasi', 'dalam_perbaikan'])->count(),
                'done_month' => DamageTicket::where('status', 'selesai')->whereMonth('resolved_at', now()->month)->whereYear('resolved_at', now()->year)->count(),
                'cost_month' => (float) DamageTicket::where('status', 'selesai')->whereMonth('resolved_at', now()->month)->whereYear('resolved_at', now()->year)->sum('cost'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'asset_id' => ['nullable', 'exists:assets,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'urgency' => ['required', Rule::in(array_keys(DamageTicket::URGENCIES))],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        if (empty($data['asset_id']) && empty($data['room_id'])) {
            throw ValidationException::withMessages(['asset_id' => 'Pilih aset atau ruangan yang mengalami kerusakan.']);
        }

        $asset = ! empty($data['asset_id']) ? Asset::with('stock')->find($data['asset_id']) : null;

        $ticket = DamageTicket::create([
            'code' => DamageTicket::generateCode(),
            'asset_id' => $asset?->id,
            'room_id' => $data['room_id'] ?? $asset?->room_id,
            'reporter_id' => $request->user()->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'urgency' => $data['urgency'],
            'status' => 'dilaporkan',
            'photo' => $request->hasFile('photo') ? $request->file('photo')->store('tickets', 'public') : null,
        ]);

        if ($asset) {
            $this->markDamaged($asset);
        }

        AuditLogger::log('created', 'tiket_kerusakan', $ticket->id, "Melaporkan kerusakan: {$ticket->title} ({$ticket->code})");

        $admins = Notifier::admins();
        $technicians = Notifier::role(['teknisi']);
        Notifier::send(
            $admins->merge($technicians),
            'Laporan kerusakan baru',
            "{$request->user()->name} melaporkan: {$ticket->title}.".($asset ? " Aset: {$asset->name}." : ''),
            route('tickets.index'),
            $ticket->urgency === 'tinggi' ? 'danger' : 'warning',
        );

        return redirect()->route('tickets.show', $ticket)->with('success', 'Laporan kerusakan berhasil dikirim.');
    }

    public function show(DamageTicket $ticket): Response
    {
        $ticket->load(['asset.category', 'asset.room', 'room', 'reporter:id,name,email', 'technician:id,name,email']);

        return Inertia::render('Tickets/Show', [
            'ticket' => [
                ...$ticket->toArray(),
                'status_label' => $ticket->statusLabel(),
                'photo_url' => $ticket->photo ? Storage::disk('public')->url($ticket->photo) : null,
            ],
            'technicians' => User::where('role', 'teknisi')->where('is_active', true)->get(['id', 'name']),
            'statuses' => DamageTicket::STATUSES,
            'urgencies' => DamageTicket::URGENCIES,
            'timeline' => $this->timeline($ticket),
        ]);
    }

    public function update(Request $request, DamageTicket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(DamageTicket::STATUSES))],
            'technician_id' => ['nullable', 'exists:users,id'],
            'cost' => ['nullable', 'numeric', 'min:0', 'max:999999999999'],
            'repair_notes' => ['nullable', 'string', 'max:2000'],
            'urgency' => ['nullable', Rule::in(array_keys(DamageTicket::URGENCIES))],
        ]);

        if ($ticket->status === $data['status'] && empty($data['technician_id']) && ! isset($data['cost'])) {
            return back()->with('error', 'Tidak ada perubahan yang disimpan.');
        }

        $oldStatus = $ticket->status;
        $asset = $ticket->asset ? Asset::with('stock')->find($ticket->asset_id) : null;

        $ticket->update([
            'status' => $data['status'],
            'technician_id' => $data['technician_id'] ?? $ticket->technician_id,
            'cost' => $data['cost'] ?? $ticket->cost,
            'repair_notes' => $data['repair_notes'] ?? $ticket->repair_notes,
            'urgency' => $data['urgency'] ?? $ticket->urgency,
            'verified_at' => $data['status'] !== 'dilaporkan' && ! $ticket->verified_at ? now() : $ticket->verified_at,
            'resolved_at' => in_array($data['status'], ['selesai', 'tidak_dapat_diperbaiki'], true) ? now() : null,
        ]);

        if ($asset) {
            $this->syncAssetStatus($asset, $oldStatus, $data['status']);
        }

        AuditLogger::log('status', 'tiket_kerusakan', $ticket->id, "Memperbarui tiket {$ticket->code}: {$oldStatus} → {$data['status']}", ['status' => $oldStatus], ['status' => $data['status']]);

        if ($ticket->reporter_id) {
            Notifier::send(
                $ticket->reporter,
                'Status laporan kerusakan diperbarui',
                "Tiket {$ticket->code} \"{$ticket->title}\" kini berstatus {$ticket->statusLabel()}.",
                route('tickets.show', $ticket),
                $data['status'] === 'selesai' ? 'success' : 'info',
            );
        }

        return back()->with('success', 'Tiket kerusakan berhasil diperbarui.');
    }

    public function destroy(DamageTicket $ticket): RedirectResponse
    {
        $code = $ticket->code;
        $ticket->delete();
        AuditLogger::log('deleted', 'tiket_kerusakan', $ticket->id, "Menghapus tiket {$code}");

        return redirect()->route('tickets.index')->with('success', 'Tiket kerusakan dihapus.');
    }

    private function markDamaged(Asset $asset): void
    {
        if (! $asset->isBulk()) {
            $asset->update(['status' => 'rusak']);

            return;
        }

        $stock = $asset->stock;
        if (! $stock) {
            return;
        }

        $available = $stock->qty_available;
        $used = $stock->qty_in_use;

        if ($available > 0) {
            $stock->update(['qty_available' => $available - 1, 'qty_damaged' => $stock->qty_damaged + 1]);
        } elseif ($used > 0) {
            $stock->update(['qty_in_use' => $used - 1, 'qty_damaged' => $stock->qty_damaged + 1]);
        }
    }

    private function syncAssetStatus(Asset $asset, string $oldStatus, string $newStatus): void
    {
        if (! $asset->isBulk()) {
            $status = match ($newStatus) {
                'dalam_perbaikan' => 'perbaikan',
                'selesai' => 'tersedia',
                'tidak_dapat_diperbaiki' => 'rusak',
                default => null,
            };

            if ($status) {
                $asset->update(['status' => $status]);
            }

            return;
        }

        $stock = $asset->stock;
        if (! $stock) {
            return;
        }

        $values = $stock->only(['qty_available', 'qty_damaged', 'qty_repair', 'qty_in_use']);

        if ($oldStatus !== 'dalam_perbaikan' && $newStatus === 'dalam_perbaikan' && $values['qty_damaged'] > 0) {
            $values['qty_damaged']--;
            $values['qty_repair']++;
        }

        if ($oldStatus !== 'selesai' && $newStatus === 'selesai' && $values['qty_repair'] > 0) {
            $values['qty_repair']--;
            $values['qty_available']++;
        }

        if ($oldStatus !== 'tidak_dapat_diperbaiki' && $newStatus === 'tidak_dapat_diperbaiki' && $values['qty_repair'] > 0) {
            $values['qty_repair']--;
            $values['qty_damaged']++;
        }

        $stock->update($values);
    }

    private function timeline(DamageTicket $ticket): array
    {
        $items = [
            ['label' => 'Dilaporkan', 'at' => $ticket->created_at, 'done' => true, 'note' => "oleh {$ticket->reporter?->name}"],
        ];

        if ($ticket->verified_at) {
            $items[] = ['label' => 'Diverifikasi', 'at' => $ticket->verified_at, 'done' => true, 'note' => null];
        }
        if (in_array($ticket->status, ['dalam_perbaikan', 'selesai', 'tidak_dapat_diperbaiki'], true)) {
            $items[] = ['label' => 'Dalam Perbaikan', 'at' => $ticket->updated_at, 'done' => true, 'note' => $ticket->technician?->name];
        }
        if ($ticket->resolved_at) {
            $items[] = ['label' => $ticket->statusLabel(), 'at' => $ticket->resolved_at, 'done' => true, 'note' => $ticket->repair_notes];
        }

        return $items;
    }
}
