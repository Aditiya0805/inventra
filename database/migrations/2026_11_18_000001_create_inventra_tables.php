<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 30)->default('guru')->after('password');
            $table->string('phone', 30)->nullable()->after('role');
            $table->string('job_title')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('job_title');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });

        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->unsignedTinyInteger('floors_count')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code', 40)->unique();
            $table->string('name');
            $table->string('type', 40)->default('kelas');
            $table->unsignedTinyInteger('floor')->default(1);
            $table->unsignedInteger('capacity')->default(0);
            $table->string('status', 30)->default('tersedia');
            $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['building_id', 'floor']);
        });

        Schema::create('asset_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 60)->unique();
            $table->string('group', 30)->default('lainnya');
            $table->string('tracking_type', 20)->default('individual');
            $table->string('icon', 40)->default('box');
            $table->string('color', 20)->default('emerald');
            $table->unsignedInteger('min_stock')->nullable();
            $table->timestamps();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name');
            $table->foreignId('category_id')->constrained('asset_categories')->restrictOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('acquisition_date')->nullable();
            $table->decimal('value', 15, 2)->default(0);
            $table->string('funding_source')->nullable();
            $table->string('status', 30)->default('tersedia');
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_consumable')->default(false);
            $table->unsignedInteger('min_stock')->nullable();
            $table->string('disposal_reason')->nullable();
            $table->timestamp('disposed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category_id', 'status']);
            $table->index('room_id');
        });

        Schema::create('asset_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('qty_in_use')->default(0);
            $table->unsignedInteger('qty_available')->default(0);
            $table->unsignedInteger('qty_damaged')->default(0);
            $table->unsignedInteger('qty_repair')->default(0);
            $table->unsignedInteger('qty_lost')->default(0);
            $table->timestamps();

            $table->unique(['asset_id', 'room_id']);
        });

        Schema::create('asset_mutations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->foreignId('from_room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('to_room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('destination_asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->string('reason');
            $table->foreignId('moved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('moved_at');
            $table->timestamps();
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->foreignId('borrower_id')->constrained('users')->restrictOnDelete();
            $table->string('purpose');
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamp('returned_at')->nullable();
            $table->string('status', 30)->default('menunggu');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'due_date']);
        });

        Schema::create('room_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('purpose')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('status', 30)->default('menunggu');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['room_id', 'starts_at', 'ends_at']);
        });

        Schema::create('damage_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('asset_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('photo')->nullable();
            $table->string('urgency', 20)->default('sedang');
            $table->string('status', 30)->default('dilaporkan');
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('cost', 15, 2)->default(0);
            $table->text('repair_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'urgency']);
        });

        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->date('date');
            $table->string('status', 20)->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('system_qty')->default(0);
            $table->unsignedInteger('counted_qty')->default(0);
            $table->integer('difference')->default(0);
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->string('entity', 80);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 60)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['entity', 'entity_id']);
            $table->index('created_at');
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80)->unique();
            $table->text('value')->nullable();
            $table->string('group', 40)->default('umum');
            $table->timestamps();
        });

        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40)->default('info');
            $table->string('title');
            $table->text('message');
            $table->string('url')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
        Schema::dropIfExists('damage_tickets');
        Schema::dropIfExists('room_bookings');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('asset_mutations');
        Schema::dropIfExists('asset_stocks');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_categories');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('buildings');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'job_title', 'is_active', 'last_login_at']);
        });
    }
};
