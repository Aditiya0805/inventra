import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    Download,
    FileSpreadsheet,
    FileUp,
    Pencil,
    Plus,
    Printer,
    QrCode,
    RotateCcw,
    Search,
    Wallet,
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import { buttonClass } from '../../Components/Button';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import { cn, formatCurrency, formatNumber, percentage } from '../../lib/utils';

export default function AssetsIndex({ assets, filters, summary, categories, rooms, buildings, statuses, lowStocks }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;

    const applyFilter = (key, value) => {
        router.get('/aset', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

    return (
        <AppLayout title="Data Aset" subtitle={`${assets.total} catatan aset`}>
            <Head title="Data Aset" />

            <PageHeader
                title="Data Aset"
                description="Kelola seluruh aset individual dan massal, lengkap dengan lokasi, kondisi, dan riwayatnya."
                actions={
                    isAdmin && (
                        <>
                            <Link href="/aset/import" className={buttonClass('secondary', 'md')}>
                                <FileUp className="size-4" /> Impor
                            </Link>
                            <Link href={`/aset/export?format=xlsx&${new URLSearchParams(query).toString()}`} className={buttonClass('secondary', 'md')}>
                                <Download className="size-4" /> Ekspor
                            </Link>
                            <Link href="/aset/create" className={buttonClass('primary', 'md')}>
                                <Plus className="size-4" /> Tambah Aset
                            </Link>
                        </>
                    )
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Unit" value={formatNumber(summary.total)} hint={`${assets.total} catatan aset`} icon={Boxes} tone="brand" />
                <StatCard label="Tersedia" value={formatNumber(summary.tersedia)} hint={`${percentage(summary.tersedia, summary.total)}% dari total`} icon={Boxes} tone="emerald" />
                <StatCard label="Rusak & Perbaikan" value={formatNumber(summary.rusak + summary.perbaikan)} hint={`${formatNumber(summary.rusak)} rusak · ${formatNumber(summary.perbaikan)} perbaikan`} icon={AlertTriangle} tone="rose" />
                <StatCard label="Nilai Inventaris" value={formatCurrency(summary.value, true)} hint="Perkiraan nilai perolehan" icon={Wallet} tone="violet" />
            </div>

            {lowStocks?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <span className="grid size-8 place-items-center rounded-lg bg-amber-100 text-amber-700"><AlertTriangle className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-amber-800">{lowStocks.length} persediaan habis pakai di bawah stok minimum</p>
                        <p className="mt-0.5 truncate text-[10px] text-amber-600">
                            {lowStocks.map((asset) => `${asset.name} (${asset.stock?.qty_available ?? 0} tersisa)`).join(' · ')}
                        </p>
                    </div>
                    <Link href="/aset?category_id=15" className="text-[10px] font-semibold text-amber-800 underline-offset-2 hover:underline">Lihat persediaan</Link>
                </div>
            )}

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari nama, kode, merek, atau nomor seri…"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') applyFilter('q', event.currentTarget.value);
                            }}
                            onBlur={(event) => {
                                if (event.target.value !== filters.q) applyFilter('q', event.target.value);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-8.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                        />
                    </div>
                    <select value={filters.category_id ?? ''} onChange={(e) => applyFilter('category_id', e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua kategori</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <select value={filters.room_id ?? ''} onChange={(e) => applyFilter('room_id', e.target.value)} className="max-w-40 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua ruangan</option>
                        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </select>
                    <select value={filters.building_id ?? ''} onChange={(e) => applyFilter('building_id', e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua gedung</option>
                        {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
                    </select>
                    <select value={filters.status} onChange={(e) => applyFilter('status', e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua status</option>
                        {Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    <select value={filters.tracking} onChange={(e) => applyFilter('tracking', e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none">
                        <option value="">Semua jenis</option>
                        <option value="individual">Per unit</option>
                        <option value="bulk">Massal</option>
                    </select>
                    {Object.values(filters).some((value) => value && value !== 'name' && value !== 'asc') && (
                        <Link href="/aset" className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800">
                            <RotateCcw className="size-3" /> Reset
                        </Link>
                    )}
                    <Link href="/aset/labels" target="_blank" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
                        <Printer className="size-3" /> Label QR
                    </Link>
                </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
                {assets.data.length === 0 ? (
                    <EmptyState
                        icon={Boxes}
                        title="Tidak ada aset ditemukan"
                        description="Ubah filter pencarian atau tambahkan aset baru untuk mulai memantau inventaris."
                        action={isAdmin && <Link href="/aset/create" className={buttonClass('primary', 'sm')}><Plus className="size-3.5" /> Tambah Aset</Link>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Aset</th>
                                    <th className="px-3 py-3 font-semibold">Kategori</th>
                                    <th className="px-3 py-3 font-semibold">Ruangan</th>
                                    <th className="px-3 py-3 text-center font-semibold">Jumlah / Status</th>
                                    <th className="px-3 py-3 font-semibold">Kondisi</th>
                                    <th className="px-3 py-3 text-right font-semibold">Nilai</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="group transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                                                    {asset.photo_url ? (
                                                        <img src={asset.photo_url} alt="" className="size-full object-cover" />
                                                    ) : (
                                                        <Boxes className="size-4" />
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <Link href={`/aset/${asset.id}`} className="block max-w-56 truncate font-semibold text-slate-800 hover:text-brand-700">
                                                        {asset.name}
                                                    </Link>
                                                    <p className="font-mono text-[10px] text-slate-400">{asset.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-slate-600">{asset.category?.name}</p>
                                            <p className="text-[10px] text-slate-400">{asset.category?.tracking_type === 'bulk' ? 'Massal' : 'Per unit'}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            {asset.room ? (
                                                <>
                                                    <p className="text-slate-600">{asset.room.name}</p>
                                                    <p className="text-[10px] text-slate-400">{asset.room.building}</p>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-slate-400">Gudang / tanpa ruangan</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {asset.category?.tracking_type === 'bulk' ? (
                                                <div className="mx-auto w-28">
                                                    <p className="tabular text-sm font-bold text-slate-800">{formatNumber(asset.summary.total)}</p>
                                                    <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                        <div className="bg-blue-500" style={{ width: `${percentage(asset.summary.dipakai, asset.summary.total)}%` }} />
                                                        <div className="bg-emerald-500" style={{ width: `${percentage(asset.summary.tersedia, asset.summary.total)}%` }} />
                                                        <div className="bg-rose-500" style={{ width: `${percentage(asset.summary.rusak, asset.summary.total)}%` }} />
                                                        <div className="bg-amber-500" style={{ width: `${percentage(asset.summary.perbaikan, asset.summary.total)}%` }} />
                                                    </div>
                                                    <p className="mt-1 text-[9px] text-slate-400">
                                                        {asset.summary.tersedia} kosong · {asset.summary.rusak} rusak
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="tabular text-sm font-semibold text-slate-700">1</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col items-start gap-1">
                                                <Badge status={asset.status} />
                                                {asset.low_stock && <Badge color="amber">Stok menipis</Badge>}
                                            </div>
                                        </td>
                                        <td className="tabular px-3 py-3 text-right text-[11px] font-medium text-slate-600">{formatCurrency(asset.value, true)}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-0.5">
                                                <Link href={`/aset/${asset.id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-700" title="Detail">
                                                    <QrCode className="size-3.5" />
                                                </Link>
                                                {isAdmin && (
                                                    <Link href={`/aset/${asset.id}/edit`} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" title="Ubah">
                                                        <Pencil className="size-3.5" />
                                                    </Link>
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
                    <Pagination paginator={assets} />
                </div>
            </Card>

            <p className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                <FileSpreadsheet className="size-3" /> Ekspor mengikuti filter yang sedang aktif. Gunakan template impor untuk penambahan massal.
            </p>
        </AppLayout>
    );
}
