<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Loan;
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
            ->with(['asset:id,code,name,category_id,room_id', 'asset.category:id,name', 'asset.room:id,name', 'borrower:id,name', 'approver:id,name'])
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('code', 'like', "%{$v}%")
                ->orWhere('purpose', 'like', "%{$v}%")
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
            ]);

        $availableAssets = Asset::with(['category:id,name,tracking_type', 'room:id,name', 'stock'])
            ->withCount(['loans as active_loans_count' => fn ($q) => $q->whereIn('status', ['menunggu', 'disetujui', 'dipinjam'])])
            ->where(fn ($q) => $q->where('status', 'tersedia')->orWhereHas('category', fn ($c) => $c->where('tracking_type', 'bulk')))
            ->orderBy('name')
            ->get()
            ->filter(fn (Asset $asset) => $asset->isBulk()
                ? ($asset->stock?->qty_available ?? 0) > 0
                : $asset->status === 'tersedia' && $asset->active_loans_count === 0)
            ->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'code' => $asset->code,
                'name' => $asset->name,
                'category' => $asset->category?->name,
                'is_bulk' => $asset->isBulk(),
                'available' => $asset->isBulk() ? ($asset->stock?->qty_available ?? 0) : 1,
                'room' => $asset->room?->name,
            ])
            ->values();

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'filters' => $filters,
            'availableAssets' => $availableAssets,
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
            'asset_id' => ['required', 'exists:assets,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'borrower_id' => ['nullable', 'exists:users,id'],
            'purpose' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $asset = Asset::with('stock')->findOrFail($data['asset_id']);
        $this->assertAvailable($asset, (int) $data['quantity']);

        $isAdmin = $request->user()->isAdmin();
        $borrowerId = $isAdmin && ! empty($data['borrower_id']) ? (int) $data['borrower_id'] : $request->user()->id;

        $loan = Loan::create([
            'code' => Loan::generateCode(),
            'asset_id' => $asset->id,
            'quantity' => $data['quantity'],
            'borrower_id' => $borrowerId,
            'purpose' => $data['purpose'],
            'start_date' => $data['start_date'],
            'due_date' => $data['due_date'],
            'status' => $isAdmin ? 'dipinjam' : 'menunggu',
            'approved_by' => $isAdmin ? $request->user()->id : null,
            'approved_at' => $isAdmin ? now() : null,
            'notes' => $data['notes'] ?? null,
        ]);

        if ($isAdmin) {
            $this->applyLoan($asset, (int) $data['quantity']);
        }

        AuditLogger::log('created', 'peminjaman', $loan->id, "Membuat peminjaman {$loan->code} untuk {$asset->name}");

        if (! $isAdmin) {
            Notifier::send(
                Notifier::admins(),
                'Pengajuan peminjaman baru',
                "{$request->user()->name} mengajukan peminjaman {$asset->name} ({$asset->code}).",
                route('loans.index'),
                'info',
            );
        } else {
            Notifier::send($loan->borrower, 'Peminjaman disetujui', "Peminjaman {$asset->name} telah dicatat. Harap kembalikan sebelum {$loan->due_date->format('d/m/Y')}.", route('loans.index'), 'success');
        }

        return back()->with('success', $isAdmin ? 'Peminjaman berhasil dicatat.' : 'Pengajuan peminjaman menunggu persetujuan admin.');
    }

    public function approve(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'menunggu') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        $asset = Asset::with('stock')->findOrFail($loan->asset_id);
        $this->assertAvailable($asset, $loan->quantity, $loan->id);

        $loan->update([
            'status' => 'dipinjam',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);
        $this->applyLoan($asset, $loan->quantity);

        AuditLogger::log('status', 'peminjaman', $loan->id, "Menyetujui peminjaman {$loan->code}");

        Notifier::send($loan->borrower, 'Peminjaman disetujui', "Peminjaman {$asset->name} disetujui. Harap kembalikan sebelum {$loan->due_date->format('d/m/Y')}.", route('loans.index'), 'success');

        return back()->with('success', 'Peminjaman disetujui dan aset ditandai dipinjam.');
    }

    public function reject(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'menunggu') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        $loan->update(['status' => 'ditolak', 'approved_by' => $request->user()->id]);
        AuditLogger::log('status', 'peminjaman', $loan->id, "Menolak peminjaman {$loan->code}");

        Notifier::send($loan->borrower, 'Peminjaman ditolak', "Pengajuan peminjaman {$loan->asset?->name} ditolak.", route('loans.index'), 'warning');

        return back()->with('success', 'Peminjaman ditolak.');
    }

    public function returnAsset(Request $request, Loan $loan): RedirectResponse
    {
        if (! in_array($loan->status, ['disetujui', 'dipinjam'], true)) {
            return back()->with('error', 'Peminjaman ini tidak dalam status aktif.');
        }

        $asset = Asset::with('stock')->findOrFail($loan->asset_id);
        $loan->update(['status' => 'dikembalikan', 'returned_at' => now()]);
        $this->restoreLoan($asset, $loan->quantity);

        AuditLogger::log('status', 'peminjaman', $loan->id, "Menandai peminjaman {$loan->code} dikembalikan");

        return back()->with('success', 'Peminjaman selesai dan aset kembali tersedia.');
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
