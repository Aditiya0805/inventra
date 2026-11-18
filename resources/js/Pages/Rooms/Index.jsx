import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, DoorOpen, Layers, Pencil, Plus, Search, Trash2, Users, Wrench } from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import { ConfirmDialog } from '../../Components/Modal';
import { cn, formatDateTime, formatNumber, percentage } from '../../lib/utils';

const STATUS_DOT = {
    tersedia: 'bg-emerald-500',
    dipakai: 'bg-blue-500',
    dipesan: 'bg-amber-500',
    perawatan: 'bg-slate-400',
    ditutup: 'bg-slate-400',
};

function RoomCard({ room, canManage, onDelete }) {
    return (
        <Card className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
                <div className="flex min-w-0 items-start gap-2.5">
                    <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-white', STATUS_DOT[room.status] ?? 'bg-slate-400')} />
                    <div className="min-w-0">
                        <Link href={`/ruangan/${room.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700">
                            {room.name}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                            {room.code} · {room.building} · Lt. {room.floor}
                        </p>
                    </div>
                </div>
                <Badge status={room.status} />
            </div>

            <div className="flex-1 px-4 py-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Building2 className="size-3" /> {room.type_label}</span>
                    <span className="inline-flex items-center gap-1"><Users className="size-3" /> {room.capacity} orang</span>
                    <span className="inline-flex items-center gap-1"><Layers className="size-3" /> {room.asset_count} jenis · {formatNumber(room.asset_qty)} unit</span>
                </div>

                {room.seats ? (
                    <div className="mt-3.5">
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                            <span className="font-medium text-slate-500">Kursi</span>
                            <span className="tabular font-semibold text-slate-700">{room.seats.total} unit</span>
                        </div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="bg-blue-500" style={{ width: `${percentage(room.seats.dipakai, room.seats.total)}%` }} title={`Dipakai ${room.seats.dipakai}`} />
                            <div className="bg-emerald-500" style={{ width: `${percentage(room.seats.tersedia, room.seats.total)}%` }} title={`Tersedia ${room.seats.tersedia}`} />
                            <div className="bg-rose-500" style={{ width: `${percentage(room.seats.rusak, room.seats.total)}%` }} title={`Rusak ${room.seats.rusak}`} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 text-[9px] text-slate-400">
                            <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-blue-500" /> {room.seats.dipakai} dipakai</span>
                            <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-emerald-500" /> {room.seats.tersedia} kosong</span>
                            <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-rose-500" /> {room.seats.rusak} rusak</span>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 rounded-lg bg-slate-50 px-2.5 py-2 text-[10px] text-slate-400">Belum ada data kursi di ruangan ini.</p>
                )}

                {room.next_booking && (
                    <p className="mt-3 truncate rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
                        Berikutnya: {room.next_booking.title} · {formatDateTime(room.next_booking.starts_at)}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
                <div className="min-w-0 text-[10px] text-slate-500">
                    <span className="truncate">PIC: {room.responsible ?? '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Link href={`/ruangan/${room.id}`} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-700 hover:bg-brand-50">
                        Detail
                    </Link>
                    {canManage && (
                        <>
                            <Link href={`/ruangan/${room.id}/edit`} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" title="Ubah">
                                <Pencil className="size-3.5" />
                            </Link>
                            <button type="button" onClick={() => onDelete(room)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Hapus">
                                <Trash2 className="size-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default function RoomsIndex({ rooms, filters, stats, buildings, types, statuses }) {
    const { auth } = usePage().props;
    const canManage = auth?.user?.is_admin;
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilter = (key, value) => {
        router.get('/ruangan', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/ruangan/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AppLayout title="Ruangan" subtitle={`${stats.total} ruangan terdata`}>
            <Head title="Ruangan" />

            <PageHeader
                title="Manajemen Ruangan"
                description="Pantau ketersediaan, kapasitas, dan kondisi aset di setiap ruangan sekolah."
                actions={canManage && (
                    <Link href="/ruangan/create" className={buttonClass('primary', 'md')}>
                        <Plus className="size-4" /> Tambah Ruangan
                    </Link>
                )}
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Ruangan" value={stats.total} hint="Seluruh gedung" icon={DoorOpen} tone="brand" />
                <StatCard label="Tersedia" value={stats.available} hint="Siap digunakan" icon={DoorOpen} tone="emerald" />
                <StatCard label="Dipakai / Dipesan" value={stats.in_use} hint="Sedang berlangsung" icon={Users} tone="blue" />
                <StatCard label="Perawatan" value={stats.maintenance} hint="Tidak dapat dipakai" icon={Wrench} tone="amber" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-48 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari nama atau kode ruangan…"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') applyFilter('q', event.currentTarget.value);
                            }}
                            onBlur={(event) => {
                                if (event.target.value !== filters.q) applyFilter('q', event.target.value);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-8.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                        />
                    </div>
                    <select value={filters.building_id ?? ''} onChange={(event) => applyFilter('building_id', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua gedung</option>
                        {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
                    </select>
                    <select value={filters.type} onChange={(event) => applyFilter('type', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua jenis</option>
                        {Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    <select value={filters.status} onChange={(event) => applyFilter('status', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua status</option>
                        {Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    {(filters.q || filters.building_id || filters.type || filters.status) && (
                        <Link href="/ruangan" className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">Reset</Link>
                    )}
                    <span className="ml-auto text-[10px] text-slate-400">{rooms.length} ruangan ditemukan</span>
                </div>
            </Card>

            {rooms.length === 0 ? (
                <Card className="mt-5">
                    <EmptyState
                        icon={DoorOpen}
                        title="Tidak ada ruangan"
                        description="Belum ada ruangan yang cocok dengan filter Anda. Coba ubah filter atau tambahkan ruangan baru."
                        action={canManage && <Link href="/ruangan/create" className={buttonClass('primary', 'sm')}><Plus className="size-3.5" /> Tambah Ruangan</Link>}
                    />
                </Card>
            ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} canManage={canManage} onDelete={setDeleteTarget} />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Hapus ruangan?"
                description={deleteTarget ? `Ruangan ${deleteTarget.name} akan dihapus permanen.` : ''}
                confirmLabel="Hapus ruangan"
            >
                <p className="text-xs leading-relaxed text-slate-600">
                    Pastikan ruangan tidak memiliki aset. Riwayat pemesanan dan tiket yang terkait juga akan kehilangan referensi ruangan.
                </p>
            </ConfirmDialog>
        </AppLayout>
    );
}
