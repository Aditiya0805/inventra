<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'entity', 'entity_id', 'description',
        'old_values', 'new_values', 'ip_address', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function actionLabel(): string
    {
        return [
            'created' => 'Menambahkan',
            'updated' => 'Mengubah',
            'deleted' => 'Menghapus',
            'login' => 'Masuk',
            'logout' => 'Keluar',
            'status' => 'Ubah Status',
            'import' => 'Impor Data',
            'export' => 'Ekspor Data',
        ][$this->action] ?? ucfirst($this->action);
    }
}
