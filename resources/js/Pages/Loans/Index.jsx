import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    Building2,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock,
    DoorOpen,
    GraduationCap,
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

const CATEGORY_TONE = {
    kelas: 'bg-blue-50 text-blue-700 border-blue-200',
    ruangan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gedung: 'bg-purple-50 text-purple-700 border-purple-200',
    aset: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function LoansIndex({ loans, filters, availableFacilities = [], users = [], stats, statuses }) {
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

    const classes = availableFacilities.filter((f) => f.category === 'kelas');
    const specialRooms = availableFacilities.filter((f) => f.category === 'ruangan');
    const buildings = availableFacilities.filter((f) => f.category === 'gedung');

    const form = useForm({
        facility_id: availableFacilities[0]?.id ?? '',
        borrower_id: '',
        purpose: '',
        start_date: iso(today),
        due_date: iso(dueDefault),
        notes: '',
    });

    const selectedFacility = availableFacilities.find(
        (f) => String(f.id) === String(form.data.facility_id)
    );

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
            facility_id: data.facility_id || availableFacilities[0]?.id || '',
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

    const getFacilityIcon = (type) => {
        switch (type) {
            case 'gedung':
                return Building2;
            case 'kelas':
                return GraduationCap;
            default:
                return DoorOpen;
        }
    };

    return (
        <AppLayout title="Peminjaman Fasilitas" subtitle={`${loans.total} catatan peminjaman`}>
            <Head title="Peminjaman Fasilitas" />

            <PageHeader
                title="Peminjaman Fasilitas Sekolah"
                description="Layanan peminjaman resmi untuk Ruang Kelas, Gedung, dan Ruangan Khusus di MA Muhammadiyah Bandar Lampung."
                actions={
                    <>
                        <button type="button" onClick={resetFilters} className={buttonClass('secondary', 'md')}>
                            <RotateCcw className="size-4" /> Reset
                        </button>
                        {canRequest && (
                            <Button onClick={openCreate} disabled={availableFacilities.length === 0}>
                                <Plus className="size-4" /> Pinjam Kelas / Gedung / Ruangan
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Menunggu" value={formatNumber(stats.pending)} hint="Perlu persetujuan admin" icon={Clock} tone="amber" />
                <StatCard label="Aktif Dipakai" value={formatNumber(stats.active)} hint="Sedang digunakan" icon={PackageCheck} tone="indigo" />
                <StatCard label="Terlambat" value={formatNumber(stats.overdue)} hint="Melewati batas waktu" icon={AlertTriangle} tone="rose" />
                <StatCard label="Selesai" value={formatNumber(stats.returned)} hint="Sudah dikembalikan" icon={CheckCircle2} tone="emerald" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari kode, kelas, gedung, ruangan, atau peminjam…"
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
                        title="Belum ada peminjaman fasilitas"
                        description="Pengajuan peminjaman ruang kelas, gedung, atau ruangan akan muncul di sini."
                        action={canRequest && availableFacilities.length > 0 && (
                            <Button size="sm" onClick={openCreate}><Plus className="size-3.5" /> Pinjam Fasilitas</Button>
                        )}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kode &amp; Fasilitas</th>
                                    <th className="px-3 py-3 font-semibold">Kategori &amp; Lokasi</th>
                                    <th className="px-3 py-3 font-semibold">Peminjam</th>
                                    <th className="px-3 py-3 font-semibold">Periode Peminjaman</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loans.data.map((loan) => {
                                    const badgeStatus = loan.is_overdue ? 'terlambat' : loan.status;
                                    const FacilityIcon = getFacilityIcon(loan.facility_type);
                                    const categoryClass = CATEGORY_TONE[loan.facility_type] ?? CATEGORY_TONE.ruangan;

                                    return (
                                        <tr key={loan.id} className="transition hover:bg-slate-50/70">
                                            <td className="px-5 py-3">
                                                <p className="font-mono text-[10px] text-slate-400">{loan.code}</p>
                                                <div className="mt-0.5 flex items-center gap-1.5">
                                                    <FacilityIcon className="size-4 shrink-0 text-slate-500" />
                                                    <p className="font-semibold text-slate-800">
                                                        {loan.facility_name}
                                                    </p>
                                                </div>
                                                {loan.purpose && (
                                                    <p className="mt-1 max-w-72 truncate text-[10px] text-slate-500">
                                                        {loan.purpose}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={cn('inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold', categoryClass)}>
                                                    {loan.facility_type_label}
                                                </span>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {loan.facility_location}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-slate-700">{loan.borrower?.name ?? '—'}</p>
                                                {loan.approver && <p className="text-[10px] text-slate-400">Disetujui: {loan.approver.name}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-slate-700">{formatDate(loan.start_date)}</p>
                                                <p className={cn('text-[10px]', loan.is_overdue ? 'font-semibold text-rose-600' : 'text-slate-400')}>
                                                    s.d. {formatDate(loan.due_date)}
                                                    {loan.is_overdue && ' · terlambat'}
                                                </p>
                                                {loan.returned_at && <p className="text-[10px] text-emerald-600">Selesai: {formatDate(loan.returned_at)}</p>}
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
                                                                    title: 'Setujui peminjaman fasilitas?',
                                                                    description: `${loan.facility_name} akan ditandai dipinjam/dipakai oleh ${loan.borrower?.name}.`,
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
                                                                    description: `Pengajuan peminjaman ${loan.code} akan ditolak.`,
                                                                    confirmLabel: 'Tolak',
                                                                    danger: true,
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
                                                                title: 'Tandai selesai / dikembalikan?',
                                                                description: `${loan.facility_name} akan diselesaikan dan siap digunakan kembali.`,
                                                                confirmLabel: 'Tandai selesai',
                                                                danger: false,
                                                            })}
                                                            className={buttonClass('secondary', 'xs')}
                                                        >
                                                            <Undo2 className="size-3" /> Selesai
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
                                                        <span className="text-[10px] text-slate-400">Menunggu verifikasi admin</span>
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
                title="Ajukan Peminjaman Fasilitas"
                description="Pilih kelas, gedung, atau ruangan madrasah yang ingin dipinjam."
                icon={Building2}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Kirim Pengajuan</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700">
                            Fasilitas yang Dipinjam <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={form.data.facility_id}
                            onChange={(event) => form.setData('facility_id', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                            required
                        >
                            <option value="" disabled>Pilih Kelas, Gedung, atau Ruangan...</option>

                            {classes.length > 0 && (
                                <optgroup label="── RUANG KELAS ──">
                                    {classes.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.code}) — {f.capacity}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {specialRooms.length > 0 && (
                                <optgroup label="── RUANGAN & LABORATORIUM ──">
                                    {specialRooms.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.code}) — {f.location}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {buildings.length > 0 && (
                                <optgroup label="── GEDUNG MADRASAH ──">
                                    {buildings.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.code}) — {f.capacity}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        {form.errors.facility_id && (
                            <p className="mt-1 text-[11px] text-rose-500">{form.errors.facility_id}</p>
                        )}
                    </div>

                    {selectedFacility && (
                        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-xs text-slate-700">
                            <div className="rounded-lg bg-brand-600 p-2 text-white">
                                {selectedFacility.category === 'gedung' ? (
                                    <Building2 className="size-4" />
                                ) : selectedFacility.category === 'kelas' ? (
                                    <GraduationCap className="size-4" />
                                ) : (
                                    <DoorOpen className="size-4" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-900">{selectedFacility.name}</p>
                                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold border', CATEGORY_TONE[selectedFacility.category])}>
                                        {selectedFacility.category_label}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-600">
                                    {selectedFacility.location} · {selectedFacility.capacity}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                        <Input
                            label="Tujuan peminjaman"
                            required
                            value={form.data.purpose}
                            onChange={(event) => form.setData('purpose', event.target.value)}
                            error={form.errors.purpose}
                            placeholder="Contoh: Kegiatan Ujian / Rapat / Pentas Seni"
                        />
                    </div>

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
                            label="Jatuh tempo / Selesai"
                            type="date"
                            required
                            value={form.data.due_date}
                            min={form.data.start_date}
                            onChange={(event) => form.setData('due_date', event.target.value)}
                            error={form.errors.due_date}
                        />
                    </div>

                    <Textarea
                        label="Catatan tambahan"
                        rows={2}
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                        error={form.errors.notes}
                        placeholder="Contoh: Kebutuhan sound system, proyektor, atau tata kursi khusus (opsional)"
                    />

                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        {isAdmin
                            ? 'Sebagai admin, peminjaman langsung disetujui dan jadwal fasilitas akan dikunci.'
                            : 'Pengajuan akan dikirim ke admin sarana prasarana MA Muhammadiyah untuk diverifikasi.'}
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
