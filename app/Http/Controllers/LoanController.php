<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Building;
use App\Models\Loan;
use App\Models\Room;
use App\Models\User;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'status' => $request->string('status')->toString(),
            'mine' => $request->boolean('mine'),
        ];

        $loans = Loan::query()
            ->with([
                'room:id,name,code,type,building_id,floor',
                'room.building:id,name,code',
                'building:id,name,code',
                'asset:id,code,name,category_id,room_id',
                'asset.category:id,name',
                'asset.room:id,name',
                'borrower:id,name,role',
                'approver:id,name',
            ])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('code', 'like', "%{$v}%")
                ->orWhere('purpose', 'like', "%{$v}%")
                ->orWhereHas('room', fn ($r) => $r->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))
                ->orWhereHas('building', fn ($b) => $b->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))
                ->orWhereHas('asset', fn ($a) => $a->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))
                ->orWhereHas('borrower', fn ($u) => $u->where('name', 'like', "%{$v}%"))))
            ->when($filters['status'] === 'terlambat', fn ($q) => $q->whereIn('status', ['disetujui', 'dipinjam'])->whereDate('due_date', '<', today()))
            ->when($filters['status'] && $filters['status'] !== 'terlambat', fn ($q, $v) => $q->where('status', $v))
            ->when($filters['mine'], fn ($q) => $q->where('borrower_id', $request->user()->id))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Loan $loan) => [
                ...$loan->toArray(),
                'status_label' => $loan->statusLabel(),
                'is_overdue' => $loan->isOverdue(),
                'facility_name' => $loan->facilityName(),
                'facility_code' => $loan->facilityCode(),
                'facility_type' => $loan->facilityType(),
                'facility_type_label' => $loan->facilityTypeLabel(),
                'facility_location' => $loan->facilityLocation(),
            ]);

        $classes = Room::with('building')
            ->where('type', 'kelas')
            ->orderBy('name')
            ->get()
            ->map(fn (Room $room) => [
                'id' => "room_{$room->id}",
                'raw_id' => $room->id,
                'category' => 'kelas',
                'category_label' => 'Ruang Kelas',
                'name' => $room->name,
                'code' => $room->code,
                'location' => ($room->building?->name ?? 'Gedung Sekolah') . ($room->floor ? " · Lt. {$room->floor}" : ''),
                'capacity' => $room->capacity ? "Kapasitas {$room->capacity} siswa" : '1 Ruang Kelas',
            ]);

        $rooms = Room::with('building')
            ->where('type', '!=', 'kelas')
            ->orderBy('name')
            ->get()
            ->map(fn (Room $room) => [
                'id' => "room_{$room->id}",
                'raw_id' => $room->id,
                'category' => 'ruangan',
                'category_label' => 'Ruangan & Lab',
                'name' => $room->name,
                'code' => $room->code,
                'location' => ($room->building?->name ?? 'Gedung Sekolah') . ($room->floor ? " · Lt. {$room->floor}" : ''),
                'capacity' => $room->capacity ? "Kapasitas {$room->capacity} orang" : '1 Ruangan',
            ]);

        $buildings = Building::orderBy('name')
            ->get()
            ->map(fn (Building $building) => [
                'id' => "building_{$building->id}",
                'raw_id' => $building->id,
                'category' => 'gedung',
                'category_label' => 'Gedung',
                'name' => $building->name,
                'code' => $building->code,
                'location' => "Kompleks MA Muhammadiyah ({$building->code})",
                'capacity' => $building->total_floors ? "{$building->total_floors} Lantai" : '1 Unit Gedung',
            ]);

        $availableFacilities = $classes->concat($rooms)->concat($buildings)->values();

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'filters' => $filters,
            'availableFacilities' => $availableFacilities,
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
            'stats' => [
                'pending' => Loan::where('status', 'menunggu')->count(),
                'active' => Loan::whereIn('status', ['disetujui', 'dipinjam'])->count(),
                'overdue' => Loan::whereIn('status', ['disetujui', 'dipinjam'])->whereDate('due_date', '<', today())->count(),
                'returned' => Loan::where('status', 'dikembalikan')->count(),
            ],
            'statuses' => Loan::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'facility_id' => ['nullable', 'string'],
            'asset_id' => ['nullable', 'exists:assets,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'borrower_id' => ['nullable', 'exists:users,id'],
            'purpose' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $roomId = null;
        $buildingId = null;
        $assetId = null;
        $borrowableType = 'ruangan';
        $facilityName = '';
        $quantity = (int) ($data['quantity'] ?? 1);

        if (! empty($data['facility_id'])) {
            $parts = explode('_', (string) $data['facility_id']);
            $type = $parts[0] ?? '';
            $id = isset($parts[1]) ? (int) $parts[1] : 0;

            if ($type === 'building') {
                $building = Building::findOrFail($id);
                $this->assertFacilityAvailable('gedung', $building->id, $data['start_date'], $data['due_date']);
                $buildingId = $building->id;
                $borrowableType = 'gedung';
                $facilityName = $building->name;
            } elseif ($type === 'room') {
                $room = Room::with('building')->findOrFail($id);
                $borrowableType = $room->type === 'kelas' ? 'kelas' : 'ruangan';
                $this->assertFacilityAvailable($borrowableType, $room->id, $data['start_date'], $data['due_date']);
                $roomId = $room->id;
                $facilityName = $room->name;
            } else {
                throw ValidationException::withMessages([
                    'facility_id' => 'Pilihan fasilitas tidak valid.',
                ]);
            }
        } elseif (! empty($data['asset_id'])) {
            $asset = Asset::with('stock')->findOrFail($data['asset_id']);
            $this->assertAvailable($asset, $quantity);
            $assetId = $asset->id;
            $facilityName = $asset->name;
            $borrowableType = 'ruangan';
        } else {
            throw ValidationException::withMessages([
                'facility_id' => 'Harap pilih kelas, gedung, atau ruangan yang ingin dipinjam.',
            ]);
        }

        $isAdmin = $request->user()->isAdmin();
        $borrowerId = $isAdmin && ! empty($data['borrower_id']) ? (int) $data['borrower_id'] : $request->user()->id;

        $loan = Loan::create([
            'code' => Loan::generateCode(),
            'room_id' => $roomId,
            'building_id' => $buildingId,
            'asset_id' => $assetId,
            'borrowable_type' => $borrowableType,
            'quantity' => $quantity,
            'borrower_id' => $borrowerId,
            'purpose' => $data['purpose'],
            'start_date' => $data['start_date'],
            'due_date' => $data['due_date'],
            'status' => $isAdmin ? 'dipinjam' : 'menunggu',
            'approved_by' => $isAdmin ? $request->user()->id : null,
            'approved_at' => $isAdmin ? now() : null,
            'notes' => $data['notes'] ?? null,
        ]);

        if ($isAdmin && $assetId) {
            $asset = Asset::with('stock')->find($assetId);
            if ($asset) {
                $this->applyLoan($asset, $quantity);
            }
        }

        AuditLogger::log('created', 'peminjaman', $loan->id, "Membuat peminjaman {$loan->code} untuk {$facilityName}");

        if (! $isAdmin) {
            Notifier::send(
                Notifier::admins(),
                'Pengajuan peminjaman fasilitas baru',
                "{$request->user()->name} mengajukan peminjaman {$facilityName} ({$loan->code}).",
                route('loans.index'),
                'info',
            );
        } else {
            Notifier::send(
                $loan->borrower,
                'Peminjaman disetujui',
                "Peminjaman {$facilityName} telah dicatat. Harap selesaikan pemakaian sebelum {$loan->due_date->format('d/m/Y')}.",
                route('loans.index'),
                'success'
            );
        }

        return back()->with('success', $isAdmin ? 'Peminjaman fasilitas berhasil dicatat.' : 'Pengajuan peminjaman menunggu persetujuan admin.');
    }

    public function approve(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'menunggu') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        if ($loan->asset_id) {
            $asset = Asset::with('stock')->findOrFail($loan->asset_id);
            $this->assertAvailable($asset, $loan->quantity, $loan->id);
            $this->applyLoan($asset, $loan->quantity);
        }

        $loan->update([
            'status' => 'dipinjam',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $facilityName = $loan->facilityName();

        AuditLogger::log('status', 'peminjaman', $loan->id, "Menyetujui peminjaman {$loan->code}");

        Notifier::send(
            $loan->borrower,
            'Peminjaman disetujui',
            "Peminjaman {$facilityName} disetujui. Harap gunakan sesuai ketentuan sebelum {$loan->due_date->format('d/m/Y')}.",
            route('loans.index'),
            'success'
        );

        return back()->with('success', "Peminjaman disetujui dan {$facilityName} ditandai aktif dipinjam.");
    }

    public function reject(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'menunggu') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        $loan->update(['status' => 'ditolak', 'approved_by' => $request->user()->id]);
        $facilityName = $loan->facilityName();

        AuditLogger::log('status', 'peminjaman', $loan->id, "Menolak peminjaman {$loan->code}");

        Notifier::send(
            $loan->borrower,
            'Peminjaman ditolak',
            "Pengajuan peminjaman {$facilityName} ditolak.",
            route('loans.index'),
            'warning'
        );

        return back()->with('success', 'Peminjaman ditolak.');
    }

    public function returnAsset(Request $request, Loan $loan): RedirectResponse
    {
        if (! in_array($loan->status, ['disetujui', 'dipinjam'], true)) {
            return back()->with('error', 'Peminjaman ini tidak dalam status aktif.');
        }

        if ($loan->asset_id) {
            $asset = Asset::with('stock')->find($loan->asset_id);
            if ($asset) {
                $this->restoreLoan($asset, $loan->quantity);
            }
        }

        $loan->update(['status' => 'dikembalikan', 'returned_at' => now()]);
        $facilityName = $loan->facilityName();

        AuditLogger::log('status', 'peminjaman', $loan->id, "Menandai peminjaman {$loan->code} dikembalikan/selesai");

        return back()->with('success', "Peminjaman {$facilityName} telah diselesaikan dan kembali tersedia.");
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        if (! in_array($loan->status, ['menunggu', 'ditolak'], true)) {
            return back()->with('error', 'Hanya pengajuan yang belum diproses dapat dihapus.');
        }

        $code = $loan->code;
        $loan->delete();
        AuditLogger::log('deleted', 'peminjaman', $loan->id, "Menghapus pengajuan peminjaman {$code}");

        return back()->with('success', 'Pengajuan peminjaman dihapus.');
    }

    private function assertFacilityAvailable(string $type, int $id, string $startDate, string $dueDate, ?int $ignoreLoanId = null): void
    {
        $query = Loan::whereIn('status', ['menunggu', 'disetujui', 'dipinjam'])
            ->when($ignoreLoanId, fn ($q) => $q->whereKeyNot($ignoreLoanId))
            ->where(function ($q) use ($startDate, $dueDate) {
                $q->whereBetween('start_date', [$startDate, $dueDate])
                    ->orWhereBetween('due_date', [$startDate, $dueDate])
                    ->orWhere(fn ($sub) => $sub->where('start_date', '<=', $startDate)->where('due_date', '>=', $dueDate));
            });

        if ($type === 'gedung') {
            $query->where('building_id', $id);
        } else {
            $query->where('room_id', $id);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'facility_id' => 'Fasilitas ini sudah memiliki jadwal peminjaman aktif/menunggu pada periode tersebut.',
            ]);
        }
    }

    private function assertAvailable(Asset $asset, int $quantity, ?int $ignoreLoanId = null): void
    {
        if ($asset->isBulk()) {
            $available = $asset->stock?->qty_available ?? 0;
            if ($quantity > $available) {
                throw ValidationException::withMessages([
                    'quantity' => "Jumlah tersedia hanya {$available} unit.",
                ]);
            }

            return;
        }

        if ($quantity !== 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Aset individual hanya dapat dipinjam sebanyak 1 unit.',
            ]);
        }

        if ($asset->status !== 'tersedia') {
            throw ValidationException::withMessages([
                'asset_id' => 'Aset ini sedang tidak tersedia untuk dipinjam.',
            ]);
        }

        $hasActiveLoan = $asset->loans()
            ->whereIn('status', ['menunggu', 'disetujui', 'dipinjam'])
            ->when($ignoreLoanId, fn ($query) => $query->whereKeyNot($ignoreLoanId))
            ->exists();

        if ($hasActiveLoan) {
            throw ValidationException::withMessages([
                'asset_id' => 'Aset ini sedang dipinjam atau menunggu persetujuan.',
            ]);
        }
    }

    private function applyLoan(Asset $asset, int $quantity): void
    {
        if ($asset->isBulk()) {
            $stock = $asset->stock;
            $stock?->update([
                'qty_available' => max(0, $stock->qty_available - $quantity),
                'qty_in_use' => $stock->qty_in_use + $quantity,
            ]);
        } else {
            $asset->update(['status' => 'dipinjam']);
        }
    }

    private function restoreLoan(Asset $asset, int $quantity): void
    {
        if ($asset->isBulk()) {
            $stock = $asset->stock;
            $stock?->update([
                'qty_available' => $stock->qty_available + $quantity,
                'qty_in_use' => max(0, $stock->qty_in_use - $quantity),
            ]);
        } elseif (in_array($asset->status, ['dipinjam', 'dipakai'], true)) {
            $asset->update(['status' => 'tersedia']);
        }
    }
}
