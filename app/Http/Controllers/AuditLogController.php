<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'action' => $request->string('action')->toString(),
            'entity' => $request->string('entity')->toString(),
            'user_id' => $request->integer('user_id') ?: null,
            'from' => $request->string('from')->toString(),
            'to' => $request->string('to')->toString(),
        ];

        $logs = AuditLog::query()
            ->with('user:id,name,role')
            ->when($filters['q'], fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('description', 'like', "%{$v}%")
                ->orWhere('entity', 'like', "%{$v}%")))
            ->when($filters['action'], fn ($q, $v) => $q->where('action', $v))
            ->when($filters['entity'], fn ($q, $v) => $q->where('entity', $v))
            ->when($filters['user_id'], fn ($q, $v) => $q->where('user_id', $v))
            ->when($filters['from'], fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'], fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                ...$log->toArray(),
                'action_label' => $log->actionLabel(),
            ]);

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => User::orderBy('name')->get(['id', 'name', 'role']),
            'actions' => [
                'created' => 'Menambahkan',
                'updated' => 'Mengubah',
                'status' => 'Ubah Status',
                'deleted' => 'Menghapus',
                'login' => 'Masuk',
                'logout' => 'Keluar',
                'import' => 'Impor',
                'export' => 'Ekspor',
            ],
            'entities' => AuditLog::query()->select('entity')->distinct()->orderBy('entity')->pluck('entity'),
            'stats' => [
                'today' => AuditLog::whereDate('created_at', today())->count(),
                'week' => AuditLog::where('created_at', '>=', now()->subDays(7))->count(),
                'users' => AuditLog::whereDate('created_at', today())->distinct('user_id')->count('user_id'),
            ],
        ]);
    }
}
