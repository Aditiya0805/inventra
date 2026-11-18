<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public static function log(
        string $action,
        string $entity,
        ?int $entityId,
        string $description,
        ?array $old = null,
        ?array $new = null,
    ): void {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Bandingkan dua array atribut dan simpan hanya nilai yang berubah.
     */
    public static function changed(array $before, array $after): array
    {
        $changes = [];
        foreach ($after as $key => $value) {
            if (array_key_exists($key, $before) && (string) $before[$key] !== (string) $value) {
                $changes[$key] = ['dari' => $before[$key], 'menjadi' => $value];
            }
        }

        return $changes;
    }
}
