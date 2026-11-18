import { Head, router } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    ScrollText,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import { ROLE_LABELS, cn, formatDateTime, formatNumber } from '../../lib/utils';

const ACTION_COLOR = {
    created: 'emerald',
    updated: 'blue',
    status: 'amber',
    deleted: 'rose',
    login: 'violet',
    logout: 'slate',
    import: 'cyan',
    export: 'indigo',
};

const ENTITY_LABELS = {
    aset: 'Aset',
    ruangan: 'Ruangan',
    gedung: 'Gedung',
    kategori_aset: 'Kategori Aset',
    pemesanan: 'Pemesanan Ruangan',
    peminjaman: 'Peminjaman',
    tiket_kerusakan: 'Tiket Kerusakan',
    mutasi_aset: 'Mutasi Aset',
    stock_opname: 'Stock Opname',
    pengguna: 'Pengguna',
    pengaturan: 'Pengaturan',
    auth: 'Autentikasi',
};

export default function AuditLogsIndex({ logs, filters, users, actions, entities, stats }) {
    const [expanded, setExpanded] = useState(new Set());

    const applyFilter = (key, value) => {
        router.get('/log-aktivitas', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetFilters = () => router.get('/log-aktivitas', {}, { preserveState: true, preserveScroll: true });

    const toggle = (id) => {
        setExpanded((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const hasFilter = Object.values(filters).some(Boolean);

    return (
        <AppLayout title="Log Aktivitas" subtitle={`${logs.total} catatan audit`}>
            <Head title="Log Aktivitas" />

            <PageHeader
                title="Log Aktivitas"
                description="Jejak audit seluruh perubahan data penting di sistem Inventra."
                actions={
                    <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
                        <RotateCcw className="size-3.5" /> Reset filter
                    </button>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Aktivitas Hari Ini" value={formatNumber(stats.today)} hint="Sejak 00.00" icon={Activity} tone="brand" />
                <StatCard label="7 Hari Terakhir" value={formatNumber(stats.week)} hint="Total aktivitas" icon={CalendarDays} tone="blue" />
                <StatCard label="Pengguna Aktif" value={formatNumber(stats.users)} hint="Hari ini" icon={Users} tone="emerald" />
                <StatCard label="Total Catatan" value={formatNumber(logs.total)} hint="Sesuai filter" icon={ScrollText} tone="violet" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari deskripsi atau entitas…"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') applyFilter('q', event.currentTarget.value);
                            }}
                            onBlur={(event) => {
                                if (event.target.value !== (filters.q ?? '')) applyFilter('q', event.target.value);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-8.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                        />
                    </div>
                    <select
                        value={filters.action ?? ''}
                        onChange={(event) => applyFilter('action', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua aksi</option>
                        {Object.entries(actions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    <select
                        value={filters.entity ?? ''}
                        onChange={(event) => applyFilter('entity', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua entitas</option>
                        {entities.map((entity) => (
                            <option key={entity} value={entity}>{ENTITY_LABELS[entity] ?? entity}</option>
                        ))}
                    </select>
                    <select
                        value={filters.user_id ?? ''}
                        onChange={(event) => applyFilter('user_id', event.target.value)}
                        className="max-w-44 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua pengguna</option>
                        {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <input
                        type="date"
                        value={filters.from ?? ''}
                        onChange={(event) => applyFilter('from', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                        title="Dari tanggal"
                    />
                    <input
                        type="date"
                        value={filters.to ?? ''}
                        onChange={(event) => applyFilter('to', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                        title="Sampai tanggal"
                    />
                    {hasFilter && (
                        <button type="button" onClick={resetFilters} className="text-[10px] font-semibold text-slate-500 hover:text-slate-800">
                            Hapus filter
                        </button>
                    )}
                </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
                {logs.data.length === 0 ? (
                    <EmptyState
                        icon={ScrollText}
                        title="Tidak ada aktivitas"
                        description="Belum ada catatan audit yang cocok dengan filter."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Waktu</th>
                                    <th className="px-3 py-3 font-semibold">Pengguna</th>
                                    <th className="px-3 py-3 font-semibold">Aksi</th>
                                    <th className="px-3 py-3 font-semibold">Entitas</th>
                                    <th className="px-3 py-3 font-semibold">Deskripsi</th>
                                    <th className="px-5 py-3 text-right font-semibold">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.data.map((log) => {
                                    const hasChanges = (log.old_values && Object.keys(log.old_values).length) || (log.new_values && Object.keys(log.new_values).length);
                                    const isOpen = expanded.has(log.id);
                                    return (
                                        <FragmentRow
                                            key={log.id}
                                            log={log}
                                            isOpen={isOpen}
                                            hasChanges={hasChanges}
                                            onToggle={() => toggle(log.id)}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-slate-100 px-5 py-3">
                    <Pagination paginator={logs} />
                </div>
            </Card>
        </AppLayout>
    );
}

function FragmentRow({ log, isOpen, hasChanges, onToggle }) {
    return (
        <>
            <tr className={cn('transition hover:bg-slate-50/70', isOpen && 'bg-slate-50/70')}>
                <td className="px-5 py-3 whitespace-nowrap">
                    <p className="text-slate-600">{formatDateTime(log.created_at)}</p>
                    <p className="text-[10px] text-slate-400">{log.ip_address}</p>
                </td>
                <td className="px-3 py-3">
                    <p className="font-semibold text-slate-700">{log.user?.name ?? 'Sistem'}</p>
                    {log.user?.role && <p className="text-[10px] text-slate-400">{ROLE_LABELS[log.user.role] ?? log.user.role}</p>}
                </td>
                <td className="px-3 py-3">
                    <Badge color={ACTION_COLOR[log.action] ?? 'slate'}>{log.action_label}</Badge>
                </td>
                <td className="px-3 py-3">
                    <p className="text-slate-600">{ENTITY_LABELS[log.entity] ?? log.entity}</p>
                    {log.entity_id && <p className="font-mono text-[10px] text-slate-400">#{log.entity_id}</p>}
                </td>
                <td className="px-3 py-3">
                    <p className="max-w-md text-[11px] leading-relaxed text-slate-600">{log.description}</p>
                </td>
                <td className="px-5 py-3 text-right">
                    {hasChanges ? (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            {isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            {isOpen ? 'Tutup' : 'Lihat'}
                        </button>
                    ) : (
                        <span className="text-[10px] text-slate-300">—</span>
                    )}
                </td>
            </tr>
            {isOpen && hasChanges && (
                <tr className="bg-slate-50/70">
                    <td colSpan={6} className="px-5 py-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="mb-1 text-[10px] font-bold tracking-wide text-rose-500 uppercase">Nilai lama</p>
                                <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-2.5 text-[10px] leading-relaxed text-slate-600">
                                    {JSON.stringify(log.old_values ?? {}, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p className="mb-1 text-[10px] font-bold tracking-wide text-emerald-600 uppercase">Nilai baru</p>
                                <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-2.5 text-[10px] leading-relaxed text-slate-600">
                                    {JSON.stringify(log.new_values ?? {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
