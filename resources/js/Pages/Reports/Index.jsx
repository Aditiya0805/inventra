import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    BarChart3,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Download,
    FileSpreadsheet,
    FileText,
    PackageCheck,
    TrendingUp,
    Wallet,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader, StatCard } from '../../Components/Card';
import { SimpleBar } from '../../Components/Charts';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import { formatCurrency, formatNumber, percentage } from '../../lib/utils';

const TYPES = {
    inventaris: 'Inventaris Aset',
    pemanfaatan: 'Pemanfaatan Ruangan & Peminjaman',
    kerusakan: 'Kerusakan & Biaya Perbaikan',
};

export default function ReportsIndex({ filters, report, rooms, categories, buildings, opnames }) {
    const [form, setForm] = useState({
        type: filters.type,
        from: filters.from,
        to: filters.to,
        room_id: filters.room_id ?? '',
        category_id: filters.category_id ?? '',
        building_id: filters.building_id ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        router.get('/laporan', form, { preserveState: true, preserveScroll: true });
    };

    const query = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== null && value !== '')),
    ).toString();

    const exportUrl = (format) => `/laporan/export?${query}&format=${format}`;

    return (
        <AppLayout title="Laporan" subtitle={TYPES[filters.type]}>
            <Head title="Laporan" />

            <PageHeader
                title="Laporan & Rekapitulasi"
                description="Analisis inventaris, pemanfaatan ruangan, serta biaya perbaikan dalam satu tempat."
                actions={
                    <>
                        <a href={exportUrl('pdf')} className={buttonClass('secondary', 'md')}>
                            <FileText className="size-4" /> PDF
                        </a>
                        <a href={exportUrl('xlsx')} className={buttonClass('secondary', 'md')}>
                            <FileSpreadsheet className="size-4" /> Excel
                        </a>
                        <a href={exportUrl('csv')} className={buttonClass('primary', 'md')}>
                            <Download className="size-4" /> CSV
                        </a>
                    </>
                }
            />

            <Card className="p-4">
                <form onSubmit={submit} className="flex flex-wrap items-end gap-2.5">
                    <label className="min-w-52 flex-1">
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Jenis laporan</span>
                        <select
                            value={form.type}
                            onChange={(event) => setForm({ ...form, type: event.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        >
                            {Object.entries(TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Dari</span>
                        <input
                            type="date"
                            value={form.from}
                            onChange={(event) => setForm({ ...form, from: event.target.value })}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        />
                    </label>
                    <label>
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Sampai</span>
                        <input
                            type="date"
                            value={form.to}
                            onChange={(event) => setForm({ ...form, to: event.target.value })}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        />
                    </label>
                    <label>
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Ruangan</span>
                        <select
                            value={form.room_id}
                            onChange={(event) => setForm({ ...form, room_id: event.target.value })}
                            className="max-w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        >
                            <option value="">Semua ruangan</option>
                            {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Kategori</span>
                        <select
                            value={form.category_id}
                            onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                            className="max-w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        >
                            <option value="">Semua kategori</option>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className="mb-1.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Gedung</span>
                        <select
                            value={form.building_id}
                            onChange={(event) => setForm({ ...form, building_id: event.target.value })}
                            className="max-w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
                        >
                            <option value="">Semua gedung</option>
                            {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
                        </select>
                    </label>
                    <button type="submit" className={buttonClass('primary', 'sm')}>
                        <BarChart3 className="size-3.5" /> Tampilkan
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const reset = { type: filters.type, from: filters.from, to: filters.to, room_id: '', category_id: '', building_id: '' };
                            setForm(reset);
                            router.get('/laporan', { type: reset.type, from: reset.from, to: reset.to }, { preserveState: true, preserveScroll: true });
                        }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                        Hapus filter
                    </button>
                </form>
            </Card>

            {filters.type === 'inventaris' && <InventarisReport report={report} />}
            {filters.type === 'kerusakan' && <KerusakanReport report={report} />}
            {filters.type === 'pemanfaatan' && <PemanfaatanReport report={report} />}

            {opnames?.length > 0 && (
                <Card className="mt-5">
                    <CardHeader title="Stock opname terakhir" description="Riwayat pencocokan fisik terbaru" icon={ClipboardCheck} />
                    <div className="flex flex-wrap divide-y divide-slate-50 sm:divide-y-0">
                        {opnames.map((opname) => (
                            <div key={opname.id} className="min-w-52 flex-1 border-slate-100 px-5 py-3 sm:border-r last:sm:border-r-0">
                                <p className="font-mono text-[10px] text-slate-400">{opname.code}</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-800">{opname.room?.name ?? '—'}</p>
                                <p className="text-[10px] text-slate-400">
                                    {new Date(opname.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · {opname.status === 'selesai' ? 'Selesai' : 'Draft'}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </AppLayout>
    );
}

function InventarisReport({ report }) {
    const damaged = (report.damaged ?? 0) + (report.repair ?? 0) + (report.lost ?? 0);

    return (
        <>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Unit" value={formatNumber(report.total_quantity)} hint={`${formatNumber(report.asset_records)} catatan aset`} icon={Boxes} tone="brand" />
                <StatCard label="Rusak & Hilang" value={formatNumber(damaged)} hint={`${formatNumber(report.damaged)} rusak · ${formatNumber(report.repair ?? 0)} perbaikan`} icon={AlertTriangle} tone="rose" />
                <StatCard label="Nilai Inventaris" value={formatCurrency(report.value, true)} hint="Nilai perolehan aset" icon={Wallet} tone="violet" />
                <StatCard label="Aktivitas" value={formatNumber(report.mutations)} hint={`${formatNumber(report.opname_count)} stock opname`} icon={ArrowLeftRight} tone="blue" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader title="Rekap per ruangan" description={`${report.by_room?.length ?? 0} ruangan memiliki aset`} icon={Boxes} />
                    {!report.by_room?.length ? (
                        <EmptyState icon={Boxes} title="Belum ada data" description="Tidak ada aset yang cocok dengan filter." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[780px] text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-2.5 font-semibold">Ruangan</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Total</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Baik</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Rusak</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Perbaikan</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Hilang</th>
                                        <th className="px-5 py-2.5 text-right font-semibold">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.by_room.map((row) => (
                                        <tr key={row.room} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-2.5">
                                                <p className="font-semibold text-slate-800">{row.room}</p>
                                                <p className="text-[10px] text-slate-400">{row.building ?? '—'}</p>
                                            </td>
                                            <td className="tabular px-3 py-2.5 text-center font-semibold text-slate-700">{formatNumber(row.total)}</td>
                                            <td className="tabular px-3 py-2.5 text-center text-emerald-600">{formatNumber(row.good)}</td>
                                            <td className="tabular px-3 py-2.5 text-center text-rose-600">{formatNumber(row.damaged)}</td>
                                            <td className="tabular px-3 py-2.5 text-center text-amber-600">{formatNumber(row.repair)}</td>
                                            <td className="tabular px-3 py-2.5 text-center text-slate-500">{formatNumber(row.lost)}</td>
                                            <td className="tabular px-5 py-2.5 text-right font-medium text-slate-600">{formatCurrency(row.value, true)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Komposisi kategori" description="Berdasarkan jumlah unit" icon={TrendingUp} />
                    <div className="space-y-4 p-5">
                        {!report.by_category?.length && <p className="text-xs text-slate-400">Belum ada data kategori.</p>}
                        {(report.by_category ?? []).map((category) => (
                            <div key={category.category}>
                                <div className="mb-1 flex items-center justify-between text-[11px]">
                                    <span className="font-medium text-slate-600">{category.category}</span>
                                    <span className="tabular font-semibold text-slate-800">
                                        {formatNumber(category.quantity)} <span className="font-normal text-slate-400">({category.assets} aset)</span>
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-brand-600"
                                        style={{ width: `${percentage(category.quantity, report.total_quantity)}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-[10px] text-slate-400">
                                    {formatNumber(category.damaged)} rusak · nilai {formatCurrency(category.value, true)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </>
    );
}

function KerusakanReport({ report }) {
    return (
        <>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Tiket" value={formatNumber(report.ticket_count)} hint="Pada periode terpilih" icon={Wrench} tone="brand" />
                <StatCard label="Masih Terbuka" value={formatNumber(report.open_count)} hint="Belum selesai" icon={AlertTriangle} tone="amber" />
                <StatCard label="Selesai" value={formatNumber(report.resolved_count)} hint="Tuntas / tidak dapat diperbaiki" icon={CheckCircle2} tone="emerald" />
                <StatCard label="Total Biaya" value={formatCurrency(report.total_cost, true)} hint="Biaya perbaikan" icon={Wallet} tone="rose" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader title="Daftar tiket kerusakan" description={`${report.tickets?.length ?? 0} tiket terbaru`} icon={Wrench} />
                    {!report.tickets?.length ? (
                        <EmptyState icon={Wrench} title="Tidak ada tiket" description="Tidak ada kerusakan pada periode dan filter ini." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-2.5 font-semibold">Tiket</th>
                                        <th className="px-3 py-2.5 font-semibold">Aset / Ruangan</th>
                                        <th className="px-3 py-2.5 font-semibold">Urgensi</th>
                                        <th className="px-3 py-2.5 font-semibold">Status</th>
                                        <th className="px-3 py-2.5 font-semibold">Teknisi</th>
                                        <th className="px-5 py-2.5 text-right font-semibold">Biaya</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.tickets.map((ticket) => (
                                        <tr key={ticket.code} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-2.5">
                                                <p className="font-mono text-[10px] text-slate-400">{ticket.code}</p>
                                                <p className="max-w-52 truncate font-semibold text-slate-800">{ticket.title}</p>
                                                <p className="text-[10px] text-slate-400">{ticket.created_at}</p>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <p className="max-w-40 truncate text-slate-600">{ticket.asset ?? '—'}</p>
                                                <p className="text-[10px] text-slate-400">{ticket.room ?? '—'}</p>
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-500">{ticket.urgency}</td>
                                            <td className="px-3 py-2.5 text-slate-500">{ticket.status}</td>
                                            <td className="px-3 py-2.5 text-slate-500">{ticket.technician ?? '—'}</td>
                                            <td className="tabular px-5 py-2.5 text-right font-medium text-slate-600">
                                                {Number(ticket.cost) > 0 ? formatCurrency(ticket.cost) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Status tiket" description="Distribusi pada periode ini" icon={BarChart3} />
                        <div className="space-y-2.5 p-5">
                            {(report.status_summary ?? []).map((status) => (
                                <div key={status.key} className="flex items-center gap-2 text-[11px]">
                                    <span className="flex-1 text-slate-600">{status.label}</span>
                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-brand-600"
                                            style={{ width: `${percentage(status.count, report.ticket_count)}%` }}
                                        />
                                    </div>
                                    <span className="tabular w-8 text-right font-semibold text-slate-800">{formatNumber(status.count)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Aset paling sering rusak" description="Enam aset teratas" icon={AlertTriangle} />
                        <div className="divide-y divide-slate-50">
                            {!report.by_asset?.length && <p className="px-5 py-6 text-center text-xs text-slate-400">Belum ada data.</p>}
                            {(report.by_asset ?? []).map((item) => (
                                <div key={item.code ?? item.asset} className="flex items-center gap-2 px-5 py-2.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-slate-800">{item.asset ?? '—'}</p>
                                        <p className="font-mono text-[10px] text-slate-400">{item.code}</p>
                                    </div>
                                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">{item.tickets} tiket</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

function PemanfaatanReport({ report }) {
    const maxBookings = Math.max(1, ...(report.room_utilization ?? []).map((row) => row.bookings));

    return (
        <>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Pemesanan Ruangan" value={formatNumber(report.booking_count)} hint="Pada periode terpilih" icon={CalendarDays} tone="brand" />
                <StatCard label="Jam Pemakaian" value={`${formatNumber(report.booking_hours)} jam`} hint="Akumulasi durasi" icon={TrendingUp} tone="emerald" />
                <StatCard label="Peminjaman Aset" value={formatNumber(report.loan_count)} hint={`${formatNumber(report.loan_quantity)} unit dipinjam`} icon={PackageCheck} tone="violet" />
                <StatCard
                    label="Ruangan Terpakai"
                    value={formatNumber(report.room_utilization?.length ?? 0)}
                    hint="Ruangan dengan pemesanan"
                    icon={Boxes}
                    tone="blue"
                />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader title="Pemanfaatan ruangan" description="Jumlah pemesanan dan jam pakai" icon={CalendarDays} />
                    {!report.room_utilization?.length ? (
                        <EmptyState icon={CalendarDays} title="Belum ada pemesanan" description="Tidak ada pemesanan ruangan pada periode ini." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-2.5 font-semibold">Ruangan</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Pemesanan</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Disetujui</th>
                                        <th className="px-3 py-2.5 text-center font-semibold">Jam Pakai</th>
                                        <th className="px-5 py-2.5 font-semibold">Intensitas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.room_utilization.map((row) => (
                                        <tr key={row.room} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3 font-semibold text-slate-800">{row.room ?? '—'}</td>
                                            <td className="tabular px-3 py-3 text-center text-slate-700">{formatNumber(row.bookings)}</td>
                                            <td className="tabular px-3 py-3 text-center text-emerald-600">{formatNumber(row.approved)}</td>
                                            <td className="tabular px-3 py-3 text-center text-slate-600">{formatNumber(row.hours)}</td>
                                            <td className="px-5 py-3">
                                                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                                                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${percentage(row.bookings, maxBookings)}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Peminjaman per kategori" description="Jumlah transaksi & unit" icon={PackageCheck} />
                    <div className="p-5">
                        {!report.loan_by_category?.length ? (
                            <p className="py-6 text-center text-xs text-slate-400">Belum ada peminjaman.</p>
                        ) : (
                            <SimpleBar
                                items={report.loan_by_category.map((row, index) => ({
                                    name: `${row.category} (${row.loans}×)`,
                                    value: row.quantity,
                                    percent: percentage(row.quantity, report.loan_quantity),
                                    color: ['emerald', 'blue', 'amber', 'violet', 'sky', 'rose'][index % 6],
                                }))}
                            />
                        )}
                    </div>
                </Card>
            </div>

            <Card className="mt-5">
                <CardHeader title="Pemesanan terbaru" description="20 pemesanan terakhir pada periode ini" icon={CalendarDays} />
                {!report.recent_bookings?.length ? (
                    <p className="px-5 py-8 text-center text-xs text-slate-400">Belum ada pemesanan.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-2.5 font-semibold">Kode</th>
                                    <th className="px-3 py-2.5 font-semibold">Kegiatan</th>
                                    <th className="px-3 py-2.5 font-semibold">Ruangan</th>
                                    <th className="px-3 py-2.5 font-semibold">Pemohon</th>
                                    <th className="px-3 py-2.5 font-semibold">Waktu</th>
                                    <th className="px-5 py-2.5 text-right font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {report.recent_bookings.map((booking) => (
                                    <tr key={booking.code} className="transition hover:bg-slate-50/60">
                                        <td className="px-5 py-2.5 font-mono text-[10px] text-slate-400">{booking.code}</td>
                                        <td className="max-w-56 px-3 py-2.5 font-semibold text-slate-700"><span className="line-clamp-1">{booking.title}</span></td>
                                        <td className="px-3 py-2.5 text-slate-500">{booking.room ?? '—'}</td>
                                        <td className="px-3 py-2.5 text-slate-500">{booking.user ?? '—'}</td>
                                        <td className="px-3 py-2.5 text-slate-500">{booking.starts_at}</td>
                                        <td className="px-5 py-2.5 text-right text-slate-500">{booking.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}
