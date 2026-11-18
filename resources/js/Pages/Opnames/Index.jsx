import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    FileDiff,
    ListChecks,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import { Input, Select, Textarea } from '../../Components/Form';
import Modal, { ConfirmDialog } from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import { formatDate, formatNumber } from '../../lib/utils';

const todayIso = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function OpnamesIndex({ opnames, rooms, stats }) {
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const form = useForm({
        room_id: '',
        date: todayIso(),
        notes: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/opname', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    const askDelete = (opname) => {
        setConfirm({
            title: 'Hapus draft stock opname?',
            description: `${opname.code} di ${opname.room?.name ?? 'ruangan'} akan dihapus permanen.`,
            run: () => {
                router.delete(`/opname/${opname.id}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirm(null),
                });
            },
        });
    };

    return (
        <AppLayout title="Stock Opname" subtitle={`${opnames.total} sesi pencatatan`}>
            <Head title="Stock Opname" />

            <PageHeader
                title="Stock Opname"
                description="Cocokkan jumlah fisik aset dengan data sistem dan sesuaikan selisihnya."
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="size-4" /> Mulai Opname
                    </Button>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Sesi" value={formatNumber(stats.total)} hint="Seluruh stock opname" icon={ClipboardCheck} tone="brand" />
                <StatCard label="Draft" value={formatNumber(stats.draft)} hint="Belum diselesaikan" icon={ListChecks} tone="amber" />
                <StatCard label="Selesai Bulan Ini" value={formatNumber(stats.done_month)} hint="Opname tuntas" icon={CheckCircle2} tone="emerald" />
                <StatCard label="Selisih Bulan Ini" value={formatNumber(stats.difference_month)} hint="Total selisih unit" icon={FileDiff} tone="rose" />
            </div>

            <Card className="mt-5 overflow-hidden">
                {opnames.data.length === 0 ? (
                    <EmptyState
                        icon={ClipboardCheck}
                        title="Belum ada sesi stock opname"
                        description="Mulai sesi baru untuk mencocokkan aset fisik pada suatu ruangan."
                        action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="size-3.5" /> Mulai Opname</Button>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kode</th>
                                    <th className="px-3 py-3 font-semibold">Ruangan</th>
                                    <th className="px-3 py-3 font-semibold">Tanggal</th>
                                    <th className="px-3 py-3 font-semibold">Petugas</th>
                                    <th className="px-3 py-3 text-center font-semibold">Item</th>
                                    <th className="px-3 py-3 text-center font-semibold">Selisih</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {opnames.data.map((opname) => (
                                    <tr key={opname.id} className="transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <Link href={`/opname/${opname.id}`} className="font-mono text-[11px] font-semibold text-brand-700 hover:text-brand-800">
                                                {opname.code}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="font-semibold text-slate-700">{opname.room?.name ?? '—'}</p>
                                            <p className="text-[10px] text-slate-400">{opname.room?.building?.name}</p>
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">{formatDate(opname.date)}</td>
                                        <td className="px-3 py-3 text-slate-600">{opname.user?.name ?? '—'}</td>
                                        <td className="tabular px-3 py-3 text-center font-semibold text-slate-700">{formatNumber(opname.items_count)}</td>
                                        <td className="tabular px-3 py-3 text-center">
                                            <span
                                                className={
                                                    Number(opname.difference) === 0
                                                        ? 'font-semibold text-slate-400'
                                                        : Number(opname.difference) > 0
                                                            ? 'font-semibold text-emerald-600'
                                                            : 'font-semibold text-rose-600'
                                                }
                                            >
                                                {Number(opname.difference) > 0 ? '+' : ''}{formatNumber(opname.difference)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3"><Badge status={opname.status} /></td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/opname/${opname.id}`} className={buttonClass('secondary', 'xs')}>
                                                    Detail <ChevronRight className="size-3" />
                                                </Link>
                                                {opname.status === 'draft' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => askDelete(opname)}
                                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                        title="Hapus draft"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-slate-100 px-5 py-3">
                    <Pagination paginator={opnames} />
                </div>
            </Card>

            <p className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                <CalendarDays className="size-3" /> Menyelesaikan opname akan menyesuaikan stok massal dan status aset individual sesuai hasil hitung fisik.
            </p>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Mulai stock opname"
                description="Pilih ruangan yang akan dihitung. Seluruh aset aktif di ruangan tersebut akan dimuat."
                icon={ClipboardCheck}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Mulai opname</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3">
                    <Select
                        label="Ruangan"
                        required
                        value={form.data.room_id}
                        onChange={(event) => form.setData('room_id', event.target.value)}
                        error={form.errors.room_id}
                        placeholder="Pilih ruangan"
                    >
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>{room.name} — {room.building?.name}</option>
                        ))}
                    </Select>
                    <Input
                        label="Tanggal pelaksanaan"
                        type="date"
                        required
                        value={form.data.date}
                        onChange={(event) => form.setData('date', event.target.value)}
                        error={form.errors.date}
                    />
                    <Textarea
                        label="Catatan sesi"
                        rows={2}
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                        error={form.errors.notes}
                        placeholder="Contoh: Opname akhir semester gasal"
                    />
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        Hasil hitung awal otomatis mengikuti jumlah sistem. Anda dapat mengubahnya pada halaman detail sebelum diselesaikan.
                    </p>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirm)}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm?.run?.()}
                title={confirm?.title}
                description={confirm?.description}
                confirmLabel="Ya, hapus"
            />
        </AppLayout>
    );
}
