import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    ArrowRight,
    Boxes,
    CalendarDays,
    DoorOpen,
    MapPin,
    Plus,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Button, { buttonClass } from '../../Components/Button';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import { Input, Select, Textarea } from '../../Components/Form';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import { cn, formatDate, formatNumber } from '../../lib/utils';

const todayIso = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function MutationsIndex({ mutations, filters, assets, rooms, stats }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;
    const [open, setOpen] = useState(false);

    const form = useForm({
        asset_id: '',
        to_room_id: '',
        quantity: 1,
        reason: '',
        moved_at: todayIso(),
    });

    const selectedAsset = assets.find((asset) => String(asset.id) === String(form.data.asset_id));
    const destinationRooms = rooms.filter((room) => String(room.id) !== String(selectedAsset?.room_id));

    const applyFilter = (key, value) => {
        router.get('/mutasi', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openCreate = () => {
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/mutasi', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset('asset_id', 'to_room_id', 'reason');
                form.setData('quantity', 1);
            },
        });
    };

    return (
        <AppLayout title="Mutasi Aset" subtitle={`${mutations.total} catatan mutasi`}>
            <Head title="Mutasi Aset" />

            <PageHeader
                title="Mutasi Aset"
                description="Catat perpindahan aset antar ruangan dan jaga akurasi lokasi inventaris."
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => router.get('/mutasi', {}, { preserveState: true, preserveScroll: true })}
                            className={buttonClass('secondary', 'md')}
                        >
                            <RotateCcw className="size-4" /> Reset
                        </button>
                        {isAdmin && (
                            <Button onClick={openCreate} disabled={assets.length === 0 || rooms.length < 2}>
                                <Plus className="size-4" /> Catat Mutasi
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Mutasi" value={formatNumber(stats.total)} hint="Sepanjang waktu" icon={ArrowLeftRight} tone="brand" />
                <StatCard label="Bulan Ini" value={formatNumber(stats.month)} hint="Catatan mutasi" icon={CalendarDays} tone="blue" />
                <StatCard label="Unit Dipindah" value={formatNumber(stats.units)} hint="Total unit bulan ini" icon={Boxes} tone="violet" />
                <StatCard label="Ruangan Tujuan" value={formatNumber(stats.rooms)} hint="Ruangan menerima aset" icon={DoorOpen} tone="emerald" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari kode mutasi, aset, atau alasan…"
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
                        value={filters.room_id ?? ''}
                        onChange={(event) => applyFilter('room_id', event.target.value)}
                        className="max-w-52 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua ruangan</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>{room.name} — {room.building?.name}</option>
                        ))}
                    </select>
                    {(filters.q || filters.room_id) && (
                        <button
                            type="button"
                            onClick={() => router.get('/mutasi', {}, { preserveState: true, preserveScroll: true })}
                            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                            Hapus filter
                        </button>
                    )}
                </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
                {mutations.data.length === 0 ? (
                    <EmptyState
                        icon={ArrowLeftRight}
                        title="Belum ada mutasi aset"
                        description="Perpindahan aset antar ruangan akan tercatat di sini."
                        action={isAdmin && <Button size="sm" onClick={openCreate}><Plus className="size-3.5" /> Catat Mutasi</Button>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kode &amp; Aset</th>
                                    <th className="px-3 py-3 text-center font-semibold">Jumlah</th>
                                    <th className="px-3 py-3 font-semibold">Rute perpindahan</th>
                                    <th className="px-3 py-3 font-semibold">Alasan</th>
                                    <th className="px-3 py-3 font-semibold">Dicatat oleh</th>
                                    <th className="px-5 py-3 text-right font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {mutations.data.map((mutation) => (
                                    <tr key={mutation.id} className="transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <p className="font-mono text-[10px] text-slate-400">{mutation.code}</p>
                                            <p className="mt-0.5 max-w-56 truncate font-semibold text-slate-800">{mutation.asset?.name ?? 'Aset dihapus'}</p>
                                            <p className="text-[10px] text-slate-400">{mutation.asset?.code} · {mutation.asset?.category?.name}</p>
                                        </td>
                                        <td className="tabular px-3 py-3 text-center">
                                            <span className="inline-flex rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                                                {formatNumber(mutation.quantity)} unit
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="max-w-36 truncate rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                                                    {mutation.from_room?.name ?? 'Tanpa ruangan'}
                                                </span>
                                                <ArrowRight className="size-3 shrink-0 text-slate-400" />
                                                <span className="max-w-36 truncate rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                    {mutation.to_room?.name ?? '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="max-w-52 truncate text-[11px] text-slate-600" title={mutation.reason}>{mutation.reason}</p>
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">{mutation.mover?.name ?? 'Sistem'}</td>
                                        <td className="px-5 py-3 text-right">
                                            <p className="text-slate-600">{formatDate(mutation.moved_at)}</p>
                                            <p className="text-[10px] text-slate-400">{formatDate(mutation.created_at)}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-slate-100 px-5 py-3">
                    <Pagination paginator={mutations} />
                </div>
            </Card>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Catat mutasi aset"
                description="Pindahkan aset ke ruangan lain. Jumlah stok kedua ruangan akan diperbarui otomatis."
                icon={ArrowLeftRight}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Simpan mutasi</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3">
                    <Select
                        label="Aset yang dipindahkan"
                        required
                        value={form.data.asset_id}
                        onChange={(event) => {
                            form.setData('asset_id', event.target.value);
                            form.setData('quantity', 1);
                            form.setData('to_room_id', '');
                        }}
                        error={form.errors.asset_id}
                        placeholder="Pilih aset"
                    >
                        {assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.code}) — {asset.room ?? 'tanpa ruangan'}
                            </option>
                        ))}
                    </Select>

                    {selectedAsset && (
                        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                            <div className="min-w-0 text-[11px]">
                                <p className="font-semibold text-slate-800">Lokasi saat ini: {selectedAsset.room ?? 'Tanpa ruangan'}</p>
                                <p className="mt-0.5 text-slate-500">
                                    {selectedAsset.category} ·{' '}
                                    {selectedAsset.is_bulk
                                        ? `${formatNumber(selectedAsset.available)} unit tersedia untuk dimutasi`
                                        : 'Aset individual (1 unit)'}
                                </p>
                            </div>
                        </div>
                    )}

                    <Select
                        label="Ruangan tujuan"
                        required
                        value={form.data.to_room_id}
                        onChange={(event) => form.setData('to_room_id', event.target.value)}
                        error={form.errors.to_room_id}
                        placeholder="Pilih ruangan tujuan"
                    >
                        {destinationRooms.map((room) => (
                            <option key={room.id} value={room.id}>{room.name} — {room.building?.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Jumlah unit"
                            type="number"
                            min="1"
                            max={selectedAsset?.is_bulk ? selectedAsset.available : 1}
                            required
                            disabled={!selectedAsset?.is_bulk}
                            value={form.data.quantity}
                            onChange={(event) => form.setData('quantity', event.target.value)}
                            error={form.errors.quantity}
                            hint={selectedAsset?.is_bulk ? `Tersedia ${formatNumber(selectedAsset.available)} unit` : 'Individual: 1 unit'}
                        />
                        <Input
                            label="Tanggal mutasi"
                            type="date"
                            required
                            value={form.data.moved_at}
                            onChange={(event) => form.setData('moved_at', event.target.value)}
                            error={form.errors.moved_at}
                        />
                    </div>

                    <Textarea
                        label="Alasan mutasi"
                        required
                        rows={2}
                        value={form.data.reason}
                        onChange={(event) => form.setData('reason', event.target.value)}
                        error={form.errors.reason}
                        placeholder="Contoh: Penataan ulang laboratorium komputer"
                    />

                    <p className={cn('rounded-lg bg-brand-50 px-3 py-2 text-[10px] text-brand-700')}>
                        Mutasi massal akan memecah/menggabungkan stok pada ruangan tujuan secara otomatis dan tercatat pada log aktivitas.
                    </p>
                </form>
            </Modal>
        </AppLayout>
    );
}
