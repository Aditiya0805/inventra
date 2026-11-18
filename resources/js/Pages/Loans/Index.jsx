import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock,
    PackageCheck,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    Undo2,
    X,
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
import { ROLE_LABELS, cn, formatDate, formatNumber } from '../../lib/utils';

const STATUS_TONE = {
    menunggu: 'amber',
    disetujui: 'emerald',
    dipinjam: 'indigo',
    dikembalikan: 'slate',
    ditolak: 'rose',
    terlambat: 'rose',
};

export default function LoansIndex({ loans, filters, availableAssets, users, stats, statuses }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.is_admin;
    const isTechnician = user?.role === 'teknisi';
    const canOperate = isAdmin || isTechnician;
    const canRequest = user?.role !== 'viewer';

    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const today = new Date();
    const iso = (date) => date.toISOString().slice(0, 10);
    const dueDefault = new Date(today.getTime() + 3 * 86400000);

    const form = useForm({
        asset_id: availableAssets[0]?.id ?? '',
        quantity: 1,
        borrower_id: '',
        purpose: '',
        start_date: iso(today),
        due_date: iso(dueDefault),
        notes: '',
    });

    const selectedAsset = availableAssets.find((asset) => String(asset.id) === String(form.data.asset_id));

    const applyFilter = (key, value) => {
        router.get(
            '/peminjaman',
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetFilters = () => router.get('/peminjaman', {}, { preserveState: true, preserveScroll: true });

    const openCreate = () => {
        form.clearErrors();
        form.setData((data) => ({
            ...data,
            asset_id: data.asset_id || availableAssets[0]?.id || '',
            borrower_id: '',
        }));
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/peminjaman', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset('purpose', 'notes');
            },
        });
    };

    const act = (loan, action, message) => {
        setConfirm({
            title: message.title,
            description: message.description,
            confirmLabel: message.confirmLabel,
            danger: message.danger ?? false,
            run: () => {
                router.post(`/peminjaman/${loan.id}/${action}`, {}, {
                    preserveScroll: true,
                    onFinish: () => setConfirm(null),
                });
            },
        });
    };

    const remove = (loan) => {
        setConfirm({
            title: 'Hapus pengajuan peminjaman?',
            description: `Pengajuan ${loan.code} akan dihapus permanen.`,
            confirmLabel: 'Ya, hapus',
            danger: true,
            run: () => {
                router.delete(`/peminjaman/${loan.id}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirm(null),
                });
            },
        });
    };

    return (
        <AppLayout title="Peminjaman" subtitle={`${loans.total} catatan peminjaman`}>
            <Head title="Peminjaman" />

            <PageHeader
                title="Peminjaman Aset"
                description="Ajukan peminjaman, setujui permintaan, dan pantau pengembalian aset sekolah."
                actions={
                    <>
                        <button type="button" onClick={resetFilters} className={buttonClass('secondary', 'md')}>
                            <RotateCcw className="size-4" /> Reset
                        </button>
                        {canRequest && (
                            <Button onClick={openCreate} disabled={availableAssets.length === 0}>
                                <Plus className="size-4" /> Ajukan Peminjaman
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Menunggu" value={formatNumber(stats.pending)} hint="Perlu persetujuan admin" icon={Clock} tone="amber" />
                <StatCard label="Aktif Dipinjam" value={formatNumber(stats.active)} hint="Belum dikembalikan" icon={PackageCheck} tone="indigo" />
                <StatCard label="Terlambat" value={formatNumber(stats.overdue)} hint="Melewati jatuh tempo" icon={AlertTriangle} tone="rose" />
                <StatCard label="Selesai" value={formatNumber(stats.returned)} hint="Sudah dikembalikan" icon={CheckCircle2} tone="emerald" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari kode, aset, atau peminjam…"
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
                        value={filters.status ?? ''}
                        onChange={(event) => applyFilter('status', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua status</option>
                        <option value="terlambat">Terlambat</option>
                        {Object.entries(statuses).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                        <input
                            type="checkbox"
                            checked={Boolean(filters.mine)}
                            onChange={(event) => applyFilter('mine', event.target.checked ? 1 : '')}
                            className="size-3.5 rounded border-slate-300 text-brand-700 focus:ring-brand-500/30"
                        />
                        Peminjaman saya
                    </label>
                    {Object.entries(filters).some(([key, value]) => value && key !== 'mine') && (
                        <button type="button" onClick={resetFilters} className="text-[10px] font-semibold text-slate-500 hover:text-slate-800">
                            Hapus filter
                        </button>
                    )}
                </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
                {loans.data.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title="Belum ada peminjaman"
                        description="Pengajuan peminjaman aset akan muncul di sini."
                        action={canRequest && availableAssets.length > 0 && (
                            <Button size="sm" onClick={openCreate}><Plus className="size-3.5" /> Ajukan Peminjaman</Button>
                        )}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kode &amp; Aset</th>
                                    <th className="px-3 py-3 font-semibold">Peminjam</th>
                                    <th className="px-3 py-3 font-semibold">Periode</th>
                                    <th className="px-3 py-3 text-center font-semibold">Jumlah</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loans.data.map((loan) => {
                                    const badgeStatus = loan.is_overdue ? 'terlambat' : loan.status;
                                    return (
                                        <tr key={loan.id} className="transition hover:bg-slate-50/70">
                                            <td className="px-5 py-3">
                                                <p className="font-mono text-[10px] text-slate-400">{loan.code}</p>
                                                <p className="mt-0.5 max-w-56 truncate font-semibold text-slate-800">
                                                    {loan.asset?.name ?? 'Aset dihapus'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {loan.asset?.code} · {loan.asset?.room?.name ?? 'Tanpa ruangan'}
                                                </p>
                                                {loan.purpose && <p className="mt-1 max-w-64 truncate text-[10px] text-slate-500">{loan.purpose}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-slate-700">{loan.borrower?.name ?? '—'}</p>
                                                {loan.approver && <p className="text-[10px] text-slate-400">Disetujui {loan.approver.name}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-slate-600">{formatDate(loan.start_date)}</p>
                                                <p className={cn('text-[10px]', loan.is_overdue ? 'font-semibold text-rose-600' : 'text-slate-400')}>
                                                    s.d. {formatDate(loan.due_date)}
                                                    {loan.is_overdue && ' · terlambat'}
                                                </p>
                                                {loan.returned_at && <p className="text-[10px] text-emerald-600">Kembali {formatDate(loan.returned_at)}</p>}
                                            </td>
                                            <td className="tabular px-3 py-3 text-center font-semibold text-slate-700">
                                                {formatNumber(loan.quantity)}
                                                <span className="ml-0.5 text-[9px] font-normal text-slate-400">unit</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge status={badgeStatus} color={STATUS_TONE[badgeStatus]} dot>
                                                    {loan.status_label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap items-center justify-end gap-1">
                                                    {isAdmin && loan.status === 'menunggu' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => act(loan, 'approve', {
                                                                    title: 'Setujui peminjaman?',
                                                                    description: `${loan.asset?.name} akan ditandai dipinjam oleh ${loan.borrower?.name}.`,
                                                                    confirmLabel: 'Setujui',
                                                                    danger: false,
                                                                })}
                                                                className={buttonClass('success', 'xs')}
                                                            >
                                                                <Check className="size-3" /> Setujui
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => act(loan, 'reject', {
                                                                    title: 'Tolak peminjaman?',
                                                                    description: `Pengajuan ${loan.code} akan ditolak.`,
                                                                    confirmLabel: 'Tolak',
                                                                })}
                                                                className={buttonClass('secondary', 'xs')}
                                                            >
                                                                <X className="size-3" /> Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                    {canOperate && ['disetujui', 'dipinjam'].includes(loan.status) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => act(loan, 'return', {
                                                                title: 'Tandai dikembalikan?',
                                                                description: `${formatNumber(loan.quantity)} unit ${loan.asset?.name} akan kembali tersedia.`,
                                                                confirmLabel: 'Tandai kembali',
                                                                danger: false,
                                                            })}
                                                            className={buttonClass('secondary', 'xs')}
                                                        >
                                                            <Undo2 className="size-3" /> Kembali
                                                        </button>
                                                    )}
                                                    {isAdmin && ['menunggu', 'ditolak'].includes(loan.status) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(loan)}
                                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                            title="Hapus pengajuan"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    )}
                                                    {!isAdmin && loan.status === 'menunggu' && loan.borrower_id === user?.id && (
                                                        <span className="text-[10px] text-slate-400">Menunggu admin</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-slate-100 px-5 py-3">
                    <Pagination paginator={loans} />
                </div>
            </Card>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Ajukan peminjaman aset"
                description="Pilih aset yang tersedia dan tentukan periode peminjaman."
                icon={PackageCheck}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Kirim pengajuan</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3">
                    <Select
                        label="Aset"
                        required
                        value={form.data.asset_id}
                        onChange={(event) => {
                            form.setData('asset_id', event.target.value);
                            form.setData('quantity', 1);
                        }}
                        error={form.errors.asset_id}
                        placeholder="Pilih aset"
                    >
                        {availableAssets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.code}) — {asset.available} tersedia
                            </option>
                        ))}
                    </Select>

                    {selectedAsset && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
                            <p className="font-semibold text-slate-800">{selectedAsset.name}</p>
                            <p className="mt-0.5">
                                {selectedAsset.category ?? 'Tanpa kategori'} · {selectedAsset.room ?? 'Tanpa ruangan'} ·{' '}
                                <span className="font-semibold text-emerald-700">{formatNumber(selectedAsset.available)} tersedia</span>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Jumlah"
                            type="number"
                            min="1"
                            max={selectedAsset?.available ?? 1}
                            required
                            value={form.data.quantity}
                            onChange={(event) => form.setData('quantity', event.target.value)}
                            error={form.errors.quantity}
                            hint={selectedAsset?.is_bulk ? `Maks. ${selectedAsset.available} unit` : 'Aset individual: 1 unit'}
                            disabled={!selectedAsset?.is_bulk}
                        />
                        {isAdmin ? (
                            <Select
                                label="Peminjam"
                                value={form.data.borrower_id}
                                onChange={(event) => form.setData('borrower_id', event.target.value)}
                                error={form.errors.borrower_id}
                                placeholder={`${user?.name} (saya)`}
                            >
                                {users.map((borrower) => (
                                    <option key={borrower.id} value={borrower.id}>
                                        {borrower.name} — {ROLE_LABELS[borrower.role] ?? borrower.role}
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <p className="text-[10px] text-slate-400">Peminjam</p>
                                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                            </div>
                        )}
                    </div>

                    <Input
                        label="Tujuan peminjaman"
                        required
                        value={form.data.purpose}
                        onChange={(event) => form.setData('purpose', event.target.value)}
                        error={form.errors.purpose}
                        placeholder="Contoh: Kegiatan class meeting"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Tanggal mulai"
                            type="date"
                            required
                            value={form.data.start_date}
                            onChange={(event) => form.setData('start_date', event.target.value)}
                            error={form.errors.start_date}
                        />
                        <Input
                            label="Jatuh tempo"
                            type="date"
                            required
                            value={form.data.due_date}
                            min={form.data.start_date}
                            onChange={(event) => form.setData('due_date', event.target.value)}
                            error={form.errors.due_date}
                        />
                    </div>

                    <Textarea
                        label="Catatan"
                        rows={2}
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                        error={form.errors.notes}
                        placeholder="Informasi tambahan (opsional)"
                    />

                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        {isAdmin
                            ? 'Sebagai admin, peminjaman langsung dicatat dan aset ditandai dipinjam.'
                            : 'Pengajuan akan menunggu persetujuan admin sarana prasarana.'}
                    </p>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirm)}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm?.run?.()}
                title={confirm?.title}
                description={confirm?.description}
                confirmLabel={confirm?.confirmLabel}
                danger={confirm?.danger}
            />
        </AppLayout>
    );
}
