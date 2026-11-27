<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStock;
use App\Models\Loan;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventraTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_login_screen_is_available(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertSee('Inventra');
    }

    public function test_demo_users_can_authenticate(): void
    {
        $user = User::where('email', 'admin@inventra.sch.id')->firstOrFail();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_role_based_access_is_enforced(): void
    {
        $viewer = User::where('role', 'viewer')->firstOrFail();
        $guru = User::where('email', 'guru@inventra.sch.id')->firstOrFail();
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();

        $this->actingAs($viewer)->get('/laporan')->assertOk();
        $this->actingAs($viewer)->get('/pengaturan')->assertForbidden();
        $this->actingAs($guru)->get('/laporan')->assertForbidden();
        $this->actingAs($admin)->get('/pengaturan')->assertOk();
        $this->actingAs($admin)->get('/log-aktivitas')->assertOk();
        $this->actingAs($guru)->get('/log-aktivitas')->assertForbidden();
    }

    public function test_admin_can_create_asset_and_dispose_it(): void
    {
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();
        $category = AssetCategory::where('tracking_type', 'individual')->firstOrFail();
        $room = Room::firstOrFail();

        $response = $this->actingAs($admin)->post('/aset', [
            'name' => 'Aset Uji Fitur',
            'code' => 'UJI-TEST-001',
            'category_id' => $category->id,
            'room_id' => $room->id,
            'acquisition_date' => now()->toDateString(),
            'value' => 125000,
            'funding_source' => 'BOS',
            'status' => 'tersedia',
        ]);

        $asset = Asset::where('code', 'UJI-TEST-001')->firstOrFail();
        $response->assertRedirect(route('assets.show', $asset));
        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'name' => 'Aset Uji Fitur']);

        $this->actingAs($admin)
            ->delete("/aset/{$asset->id}", ['reason' => 'Uji penghapusan aset'])
            ->assertRedirect(route('assets.index'));

        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'status' => 'dihapuskan',
            'disposal_reason' => 'Uji penghapusan aset',
        ]);

        $this->actingAs($admin)
            ->post("/aset/{$asset->id}/restore")
            ->assertRedirect();

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'tersedia']);
    }

    public function test_guru_booking_request_can_be_approved_by_admin(): void
    {
        $guru = User::where('email', 'guru@inventra.sch.id')->firstOrFail();
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();
        $room = Room::firstOrFail();
        $date = now()->addDays(20)->toDateString();

        $this->actingAs($guru)->post('/pemesanan', [
            'room_id' => $room->id,
            'title' => 'Rapat Uji Fitur',
            'purpose' => 'Menguji alur pemesanan ruangan',
            'date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ])->assertRedirect();

        $booking = RoomBooking::where('title', 'Rapat Uji Fitur')->firstOrFail();
        $this->assertSame('menunggu', $booking->status);

        $this->actingAs($admin)
            ->put("/pemesanan/{$booking->id}/status", ['status' => 'disetujui'])
            ->assertRedirect();

        $this->assertSame('disetujui', $booking->fresh()->status);
    }

    public function test_bulk_asset_loan_updates_and_restores_stock(): void
    {
        $guru = User::where('email', 'guru@inventra.sch.id')->firstOrFail();
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();

        $asset = Asset::query()
            ->whereHas('category', fn ($query) => $query->where('tracking_type', 'bulk'))
            ->whereHas('stock', fn ($query) => $query->where('qty_available', '>=', 2))
            ->firstOrFail();
        $stock = AssetStock::where('asset_id', $asset->id)->firstOrFail();
        $before = $stock->qty_available;

        $this->actingAs($guru)->post('/peminjaman', [
            'asset_id' => $asset->id,
            'quantity' => 2,
            'purpose' => 'Uji peminjaman fitur',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(),
        ])->assertRedirect();

        $loan = Loan::where('purpose', 'Uji peminjaman fitur')->firstOrFail();
        $this->assertSame('menunggu', $loan->status);

        $this->actingAs($admin)
            ->post("/peminjaman/{$loan->id}/approve")
            ->assertRedirect();

        $this->assertSame('dipinjam', $loan->fresh()->status);
        $this->assertSame($before - 2, $stock->fresh()->qty_available);

        $this->actingAs($admin)
            ->post("/peminjaman/{$loan->id}/return")
            ->assertRedirect();

        $this->assertSame('dikembalikan', $loan->fresh()->status);
        $this->assertSame($before, $stock->fresh()->qty_available);
    }

    public function test_individual_asset_cannot_be_loaned_twice(): void
    {
        $guru = User::where('email', 'guru@inventra.sch.id')->firstOrFail();
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();

        $asset = Asset::query()
            ->whereHas('category', fn ($query) => $query->where('tracking_type', 'individual'))
            ->where('status', 'tersedia')
            ->whereDoesntHave('loans', fn ($query) => $query->whereIn('status', ['menunggu', 'disetujui', 'dipinjam']))
            ->firstOrFail();

        $payload = [
            'asset_id' => $asset->id,
            'quantity' => 1,
            'purpose' => 'Uji peminjaman individual',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(),
        ];

        $this->actingAs($guru)->post('/peminjaman', $payload)->assertRedirect();
        $loan = Loan::where('asset_id', $asset->id)->latest('id')->firstOrFail();

        $this->actingAs($guru)
            ->post('/peminjaman', [...$payload, 'purpose' => 'Uji duplikat individual'])
            ->assertSessionHasErrors('asset_id');
        $this->assertSame(1, Loan::where('asset_id', $asset->id)->count());

        $this->actingAs($guru)
            ->post('/peminjaman', [...$payload, 'quantity' => 2, 'purpose' => 'Uji jumlah individual'])
            ->assertSessionHasErrors('quantity');

        $this->actingAs($admin)
            ->post("/peminjaman/{$loan->id}/approve")
            ->assertRedirect();

        $this->assertSame('dipinjam', $loan->fresh()->status);
    }

    public function test_audit_log_records_actions_with_labels(): void
    {
        $admin = User::where('email', 'admin@inventra.sch.id')->firstOrFail();

        $this->actingAs($admin)
            ->get('/log-aktivitas?action=created&entity=aset')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('AuditLogs/Index')
                ->where('logs.data.0.action_label', fn ($label) => is_string($label) && $label !== ''));
    }
}
