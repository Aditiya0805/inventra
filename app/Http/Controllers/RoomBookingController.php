<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomBooking;
use App\Support\AuditLogger;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RoomBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->filled('date') ? Carbon::parse($request->input('date')) : now();
        $weekStart = $date->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $bookings = RoomBooking::query()
            ->with(['room:id,name,code,building_id', 'room.building:id,name', 'user:id,name'])
            ->whereBetween('starts_at', [$weekStart, $weekEnd])
            ->when($request->integer('room_id'), fn ($q, $v) => $q->where('room_id', $v))
            ->orderBy('starts_at')
            ->get();

        $days = collect(range(0, 6))->map(function (int $offset) use ($weekStart) {
            return [
                'date' => $weekStart->copy()->addDays($offset)->toDateString(),
                'label' => $weekStart->copy()->addDays($offset)->translatedFormat('D'),
                'day' => $weekStart->copy()->addDays($offset)->format('d'),
                'is_today' => $weekStart->copy()->addDays($offset)->isToday(),
            ];
        });

        $pending = RoomBooking::with(['room:id,name', 'user:id,name'])
            ->where('status', 'menunggu')
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'days' => $days,
            'weekLabel' => $weekStart->translatedFormat('d M').' – '.$weekEnd->translatedFormat('d M Y'),
            'weekStart' => $weekStart->toDateString(),
            'weekEnd' => $weekEnd->toDateString(),
            'pending' => $pending,
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'code', 'building_id', 'status']),
            'filterRoom' => $request->integer('room_id') ?: null,
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:120'],
            'purpose' => ['nullable', 'string', 'max:1000'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $startsAt = Carbon::parse($data['date'].' '.$data['start_time']);
        $endsAt = Carbon::parse($data['date'].' '.$data['end_time']);

        if ($startsAt->isPast() && ! $request->user()->isAdmin()) {
            throw ValidationException::withMessages(['date' => 'Tanggal pemesanan tidak boleh di masa lalu.']);
        }

        $conflict = RoomBooking::query()
            ->where('room_id', $data['room_id'])
            ->whereIn('status', ['menunggu', 'disetujui'])
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'start_time' => 'Ruangan sudah dipesan pada rentang waktu tersebut. Silakan pilih waktu lain.',
            ]);
        }

        $isAdmin = $request->user()->isAdmin();

        $booking = RoomBooking::create([
            'code' => RoomBooking::generateCode(),
            'room_id' => $data['room_id'],
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'purpose' => $data['purpose'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => $isAdmin ? 'disetujui' : 'menunggu',
            'approved_by' => $isAdmin ? $request->user()->id : null,
        ]);

        AuditLogger::log('created', 'pemesanan_ruangan', $booking->id, "Membuat pemesanan {$booking->code} untuk {$booking->room?->name}");

        if (! $isAdmin) {
            Notifier::send(
                Notifier::admins(),
                'Pemesanan ruangan baru',
                "{$request->user()->name} mengajukan pemesanan ruangan untuk \"{$booking->title}\".",
                route('bookings.index'),
                'info',
            );
        }

        return back()->with('success', $isAdmin
            ? 'Pemesanan ruangan berhasil dibuat.'
            : 'Pemesanan dikirim dan menunggu persetujuan admin.');
    }

    public function updateStatus(Request $request, RoomBooking $booking): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:disetujui,ditolak,dibatalkan'],
        ]);

        $user = $request->user();
        $status = $data['status'];

        if ($status === 'dibatalkan') {
            if ($booking->user_id !== $user->id && ! $user->isAdmin()) {
                abort(403);
            }
        } elseif (! $user->isAdmin()) {
            abort(403, 'Hanya admin yang dapat menyetujui atau menolak pemesanan.');
        }

        if ($status === 'disetujui') {
            $conflict = RoomBooking::query()
                ->where('room_id', $booking->room_id)
                ->where('id', '!=', $booking->id)
                ->where('status', 'disetujui')
                ->where('starts_at', '<', $booking->ends_at)
                ->where('ends_at', '>', $booking->starts_at)
                ->exists();

            if ($conflict) {
                return back()->with('error', 'Tidak dapat menyetujui: sudah ada pemesanan lain yang disetujui pada waktu tersebut.');
            }
        }

        $old = $booking->status;
        $booking->update([
            'status' => $status,
            'approved_by' => $status === 'disetujui' ? $user->id : $booking->approved_by,
        ]);

        AuditLogger::log('status', 'pemesanan_ruangan', $booking->id, "Mengubah status pemesanan {$booking->code} dari {$old} menjadi {$status}", ['status' => $old], ['status' => $status]);

        if ($booking->user_id !== $user->id) {
            Notifier::send(
                $booking->user,
                'Status pemesanan ruangan',
                "Pemesanan \"{$booking->title}\" {$booking->status}.",
                route('bookings.index'),
                $status === 'disetujui' ? 'success' : 'warning',
            );
        }

        return back()->with('success', 'Status pemesanan berhasil diperbarui.');
    }

    public function destroy(Request $request, RoomBooking $booking): RedirectResponse
    {
        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $code = $booking->code;
        $booking->delete();
        AuditLogger::log('deleted', 'pemesanan_ruangan', $booking->id, "Menghapus pemesanan {$code}");

        return back()->with('success', 'Pemesanan berhasil dihapus.');
    }
}
