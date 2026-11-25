<?php

use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetImportExportController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\DamageTicketController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MutationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoomBookingController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Ruangan & pemesanan
    Route::get('/ruangan', [RoomController::class, 'index'])->name('rooms.index');
    Route::get('/ruangan/create', [RoomController::class, 'create'])->name('rooms.create')->middleware('role:super_admin,admin_sarpras');
    Route::get('/ruangan/{room}', [RoomController::class, 'show'])->name('rooms.show');
    Route::get('/ruangan/{room}/qr', [RoomController::class, 'qr'])->name('rooms.qr');
    Route::resource('ruangan', RoomController::class)->only(['store', 'edit', 'update', 'destroy'])->parameters(['ruangan' => 'room'])->middleware('role:super_admin,admin_sarpras');
    Route::get('/pemesanan', [RoomBookingController::class, 'index'])->name('bookings.index');
    Route::post('/pemesanan', [RoomBookingController::class, 'store'])->name('bookings.store')->middleware('role:super_admin,admin_sarpras,guru,teknisi');
    Route::put('/pemesanan/{booking}/status', [RoomBookingController::class, 'updateStatus'])->name('bookings.status')->middleware('role:super_admin,admin_sarpras,guru,teknisi');
    Route::delete('/pemesanan/{booking}', [RoomBookingController::class, 'destroy'])->name('bookings.destroy')->middleware('role:super_admin,admin_sarpras,guru,teknisi');

    // Aset
    Route::get('/aset', [AssetController::class, 'index'])->name('assets.index');
    Route::get('/aset/scan', [AssetController::class, 'scan'])->name('assets.scan');
    Route::get('/aset/lookup', [AssetController::class, 'lookup'])->name('assets.lookup');
    Route::get('/aset/export', [AssetImportExportController::class, 'export'])->name('assets.export')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/template', [AssetImportExportController::class, 'template'])->name('assets.template')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/import', [AssetImportExportController::class, 'importForm'])->name('assets.import')->middleware('role:super_admin,admin_sarpras');
    Route::post('/aset/import', [AssetImportExportController::class, 'import'])->name('assets.import.store')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/labels', [AssetController::class, 'labels'])->name('assets.labels');
    Route::get('/aset/create', [AssetController::class, 'create'])->name('assets.create')->middleware('role:super_admin,admin_sarpras');
    Route::post('/aset', [AssetController::class, 'store'])->name('assets.store')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/{asset}/edit', [AssetController::class, 'edit'])->name('assets.edit')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/{asset}/qr', [AssetController::class, 'qr'])->name('assets.qr');
    Route::put('/aset/{asset}/status', [AssetController::class, 'updateStatus'])->name('assets.status')->middleware('role:super_admin,admin_sarpras,teknisi');
    Route::put('/aset/{asset}/stock', [AssetController::class, 'updateStock'])->name('assets.stock')->middleware('role:super_admin,admin_sarpras');
    Route::post('/aset/{asset}/restore', [AssetController::class, 'restore'])->name('assets.restore')->middleware('role:super_admin,admin_sarpras');
    Route::put('/aset/{asset}', [AssetController::class, 'update'])->name('assets.update')->middleware('role:super_admin,admin_sarpras');
    Route::delete('/aset/{asset}', [AssetController::class, 'destroy'])->name('assets.destroy')->middleware('role:super_admin,admin_sarpras');
    Route::get('/aset/{asset}', [AssetController::class, 'show'])->name('assets.show');

    // Peminjaman
    Route::get('/peminjaman', [LoanController::class, 'index'])->name('loans.index');
    Route::post('/peminjaman', [LoanController::class, 'store'])->name('loans.store')->middleware('role:super_admin,admin_sarpras,guru,teknisi');
    Route::post('/peminjaman/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve')->middleware('role:super_admin,admin_sarpras');
    Route::post('/peminjaman/{loan}/reject', [LoanController::class, 'reject'])->name('loans.reject')->middleware('role:super_admin,admin_sarpras');
    Route::post('/peminjaman/{loan}/return', [LoanController::class, 'returnAsset'])->name('loans.return')->middleware('role:super_admin,admin_sarpras,teknisi');
    Route::delete('/peminjaman/{loan}', [LoanController::class, 'destroy'])->name('loans.destroy')->middleware('role:super_admin,admin_sarpras');

    // Tiket kerusakan
    Route::get('/tiket', [DamageTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tiket', [DamageTicketController::class, 'store'])->name('tickets.store')->middleware('role:super_admin,admin_sarpras,guru,teknisi');
    Route::get('/tiket/{ticket}', [DamageTicketController::class, 'show'])->name('tickets.show');
    Route::put('/tiket/{ticket}', [DamageTicketController::class, 'update'])->name('tickets.update')->middleware('role:super_admin,admin_sarpras,teknisi');
    Route::delete('/tiket/{ticket}', [DamageTicketController::class, 'destroy'])->name('tickets.destroy')->middleware('role:super_admin,admin_sarpras');

    // Mutasi
    Route::get('/mutasi', [MutationController::class, 'index'])->name('mutations.index');
    Route::post('/mutasi', [MutationController::class, 'store'])->name('mutations.store')->middleware('role:super_admin,admin_sarpras');

    // Stock opname
    Route::middleware('role:super_admin,admin_sarpras')->group(function () {
        Route::get('/opname', [StockOpnameController::class, 'index'])->name('opnames.index');
        Route::post('/opname', [StockOpnameController::class, 'store'])->name('opnames.store');
        Route::get('/opname/{opname}', [StockOpnameController::class, 'show'])->name('opnames.show');
        Route::put('/opname/{opname}', [StockOpnameController::class, 'update'])->name('opnames.update');
        Route::delete('/opname/{opname}', [StockOpnameController::class, 'destroy'])->name('opnames.destroy');
    });

    // Laporan
    Route::middleware('role:super_admin,admin_sarpras,viewer')->group(function () {
        Route::get('/laporan', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/laporan/export', [ReportController::class, 'export'])->name('reports.export');
    });
    Route::get('/log-aktivitas', [AuditLogController::class, 'index'])->name('audit.index')->middleware('role:super_admin,admin_sarpras');

    // Notifikasi
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifikasi/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifikasi/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

    // Pengaturan
    Route::middleware('role:super_admin,admin_sarpras')->group(function () {
        Route::get('/pengaturan', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/pengaturan/profil', [SettingController::class, 'updateProfile'])->name('settings.profile');
        Route::put('/pengaturan/peringatan', [SettingController::class, 'updateAlerts'])->name('settings.alerts');
        Route::post('/pengaturan/gedung', [BuildingController::class, 'store'])->name('buildings.store');
        Route::put('/pengaturan/gedung/{building}', [BuildingController::class, 'update'])->name('buildings.update');
        Route::delete('/pengaturan/gedung/{building}', [BuildingController::class, 'destroy'])->name('buildings.destroy');
        Route::post('/pengaturan/kategori', [AssetCategoryController::class, 'store'])->name('categories.store');
        Route::put('/pengaturan/kategori/{category}', [AssetCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/pengaturan/kategori/{category}', [AssetCategoryController::class, 'destroy'])->name('categories.destroy');
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::post('/pengaturan/pengguna', [UserController::class, 'store'])->name('users.store');
        Route::put('/pengaturan/pengguna/{user}', [UserController::class, 'update'])->name('users.update');
        Route::post('/pengaturan/pengguna/{user}/toggle', [UserController::class, 'toggle'])->name('users.toggle');
        Route::delete('/pengaturan/pengguna/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});
