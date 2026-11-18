import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    Boxes,
    CalendarDays,
    Download,
    FileText,
    History,
    MapPin,
    PackageCheck,
    Pencil,
    Printer,
    QrCode,
    RotateCcw,
    ShieldAlert,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, CardHeader, StatCard } from '../../Components/Card';
import { Input, Select, Textarea } from '../../Components/Form';
import Modal, { ConfirmDialog } from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import { cn, formatCurrency, formatDate, formatDateTime, formatNumber, percentage } from '../../lib/utils';

export default function AssetShow({ asset, qrUrl, mutations, loans, tickets, rooms, statuses }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;
    const canOperate = ['super_admin', 'admin_sarpras', 'teknisi'].includes(auth?.user?.role);
    const [stockOpen, setStockOpen] = useState(false);
    const [disposeOpen, setDisposeOpen] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState(false);

    const statusForm = useForm({ status: asset.status });
    const stockForm = useForm({
        qty_available: asset.stock?.qty_available ?? 0,
        qty_in_use: asset.stock?.qty_in_use ?? 0,
        qty_damaged: asset.stock?.qty_damaged ?? 0,
        qty_repair: asset.stock?.qty_repair ?? 0,
        qty_lost: asset.stock?.qty_lost ?? 0,
        note: '',
    });
    const disposeForm = useForm({ reason: '' });

    const isBulk = asset.is_bulk;
    const summary = asset.summary;
    const totalStock = Number(stockForm.data.qty_available) + Number(stockForm.data.qty_in_use) + Number(stockForm.data.qty_damaged) + Number(stockForm.data.qty_repair) + Number(stockForm.data.qty_lost);

    const updateStatus = (event) => {
        event.preventDefault();
        statusForm.put(`/aset/${asset.id}/status`, { preserveScroll: true });
    };

    const updateStock = (event) => {
        event.preventDefault();
        stockForm.put(`/aset/${asset.id}/stock`, {
            preserveScroll: true,
            onSuccess: () => setStockOpen(false),
        });
    };

    const dispose = () => {
        disposeForm.delete(`/aset/${asset.id}`, {
            onSuccess: () => setDisposeOpen(false),
        });
    };

    const restore = () => {
        router.post(`/aset/${asset.id}/restore`, {}, { onSuccess: () => setRestoreConfirm(false) });
    };

    return (
        <AppLayout title={asset.name} subtitle={asset.code}>
            <Head title={asset.name} />

            <PageHeader
                backHref="/aset"
                title={asset.name}
                badge={<Badge status={asset.status} />}
                description={`${asset.code} · ${asset.category?.name} · ${asset.room?.name ?? 'Tanpa ruangan'}`}
                actions={
                    <>
                        <Link href={`/aset/labels?ids=${asset.id}`} target="_blank" className={buttonClass('secondary', 'md')}>
                            <Printer className="size-4" /> Cetak Label
                        </Link>
                        {canOperate && (
                            <Link href={`/tiket?create=1&asset_id=${asset.id}`} className={buttonClass('secondary', 'md')}>
                                <AlertTriangle className="size-4" /> Laporkan
                            </Link>
                        )}
                        {isAdmin && (
                            <Link href={`/aset/${asset.id}/edit`} className={buttonClass('primary', 'md')}>
                                <Pencil className="size-4" /> Ubah Aset
                            </Link>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Unit" value={formatNumber(summary.total)} hint={isBulk ? 'Aset massal' : 'Aset individual'} icon={Boxes} tone="brand" />
                <StatCard label="Tersedia" value={formatNumber(summary.tersedia)} hint="Siap digunakan" icon={PackageCheck} tone="emerald" />
                <StatCard label="Rusak" value={formatNumber(summary.rusak)} hint={`${summary.perbaikan} dalam perbaikan`} icon={AlertTriangle} tone="rose" />
                <StatCard label="Nilai Aset" value={formatCurrency(asset.value * Math.max(summary.total, 1), true)} hint={`${formatCurrency(asset.value, true)} per unit`} icon={FileText} tone="violet" />
            </div>

            {asset.low_stock && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-800">
                        Stok tersedia ({summary.tersedia} unit) berada di bawah batas minimum ({asset.min_stock ?? asset.category?.min_stock ?? 0} unit). Segera ajukan pengadaan.
                    </p>
                </div>
            )}

            {asset.status === 'dihapuskan' && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
                    <ShieldAlert className="size-4 text-slate-500" />
                    <p className="flex-1 text-xs text-slate-600">
                        Aset ini telah dihapuskan {asset.disposed_at ? `pada ${formatDate(asset.disposed_at)}` : ''}. Alasan: {asset.disposal_reason ?? '—'}
                    </p>
                    {isAdmin && (
                        <button type="button" onClick={() => setRestoreConfirm(true)} className={buttonClass('secondary', 'sm')}>
                            <RotateCcw className="size-3.5" /> Pulihkan
                        </button>
                    )}
                </div>
            )}

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-5 xl:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="flex flex-col gap-5 p-5 sm:flex-row">
                            <div className="grid h-32 w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-slate-300 sm:w-40">
                                {asset.photo_url ? (
                                    <img src={asset.photo_url} alt={asset.name} className="size-full object-cover" />
                                ) : (
                                    <Boxes className="size-10" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge color={asset.category?.color} dot>{asset.category?.name}</Badge>
                                    <Badge color="slate">{isBulk ? 'Massal / jumlah' : 'Per unit'}</Badge>
                                    {asset.is_consumable && <Badge color="amber">Habis pakai</Badge>}
                                </div>
                                <h2 className="mt-2 text-lg font-bold text-slate-900">{asset.name}</h2>
                                <p className="font-mono text-xs text-slate-400">{asset.code}</p>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                    {[
                                        ['Merek', asset.brand ?? '—'],
                                        ['Model', asset.model ?? '—'],
                                        ['Nomor seri', asset.serial_number ?? '—'],
                                        ['Ruangan', asset.room?.name ?? 'Tanpa ruangan'],
                                        ['Gedung', asset.room?.building?.name ?? '—'],
                                        ['Tanggal perolehan', asset.acquisition_date ? formatDate(asset.acquisition_date) : '—'],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <p className="text-[10px] text-slate-400">{label}</p>
                                            <p className="truncate font-medium text-slate-700">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4">
                            {[
                                ['Sumber dana', asset.funding_source ?? '—'],
                                ['Nilai per unit', formatCurrency(asset.value)],
                                ['Status', statuses[asset.status] ?? asset.status],
                                ['Terakhir diperbarui', formatDate(asset.updated_at)],
                            ].map(([label, value]) => (
                                <div key={label} className="bg-white px-5 py-3">
                                    <p className="text-[10px] text-slate-400">{label}</p>
                                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{value}</p>
                                </div>
                            ))}
                        </div>
                        {asset.notes && (
                            <div className="border-t border-slate-100 px-5 py-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase">Catatan</p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">{asset.notes}</p>
                            </div>
                        )}
                    </Card>

                    {isBulk && (
                        <Card>
                            <CardHeader
                                title="Rincian jumlah aset massal"
                                description="Distribusi unit berdasarkan status"
                                icon={Boxes}
                                action={isAdmin && <Button size="sm" variant="secondary" onClick={() => setStockOpen(true)}>Ubah jumlah</Button>}
                            />
                            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-5">
                                {[
                                    ['Tersedia', summary.tersedia, 'bg-emerald-500', 'bg-emerald-50 text-emerald-700'],
                                    ['Dipakai', summary.dipakai, 'bg-blue-500', 'bg-blue-50 text-blue-700'],
                                    ['Rusak', summary.rusak, 'bg-rose-500', 'bg-rose-50 text-rose-700'],
                                    ['Perbaikan', summary.perbaikan, 'bg-amber-500', 'bg-amber-50 text-amber-700'],
                                    ['Hilang', summary.hilang, 'bg-slate-500', 'bg-slate-100 text-slate-600'],
                                ].map(([label, value, bar, tone]) => (
                                    <div key={label} className={cn('rounded-xl p-3', tone)}>
                                        <p className="text-[10px] font-medium">{label}</p>
                                        <p className="tabular mt-1 text-xl font-bold">{value}</p>
                                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/70">
                                            <div className={cn('h-full rounded-full', bar)} style={{ width: `${percentage(value, summary.total)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Riwayat mutasi" description="Perpindahan aset antar ruangan" icon={ArrowLeftRight} />
                        {mutations.length === 0 ? (
                            <p className="px-5 py-8 text-center text-xs text-slate-400">Belum ada riwayat mutasi.</p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {mutations.map((mutation) => (
                                    <div key={mutation.id} className="flex items-start gap-3 px-5 py-3">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><ArrowLeftRight className="size-3.5" /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-slate-800">
                                                {mutation.quantity} unit · {mutation.from_room?.name ?? 'Gudang'} → {mutation.to_room?.name ?? 'Gudang'}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-slate-500">{mutation.reason}</p>
                                            <p className="text-[10px] text-slate-400">{formatDate(mutation.moved_at)} · {mutation.mover?.name}</p>
                                        </div>
                                        <span className="font-mono text-[9px] text-slate-300">{mutation.code}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <div className="grid gap-5 md:grid-cols-2">
                        <Card>
                            <CardHeader title="Riwayat peminjaman" description={`${loans.length} catatan terakhir`} icon={PackageCheck} />
                            {loans.length === 0 ? (
                                <p className="px-5 py-8 text-center text-xs text-slate-400">Belum pernah dipinjam.</p>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {loans.map((loan) => (
                                        <div key={loan.id} className="px-5 py-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-slate-800">{loan.borrower?.name}</p>
                                                <Badge status={loan.is_overdue ? 'terlambat' : loan.status} />
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500">{formatDate(loan.start_date)} – {formatDate(loan.due_date)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <CardHeader title="Riwayat kerusakan" description={`${tickets.length} tiket terakhir`} icon={Wrench} />
                            {tickets.length === 0 ? (
                                <p className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada laporan kerusakan.</p>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {tickets.map((ticket) => (
                                        <Link key={ticket.id} href={`/tiket/${ticket.id}`} className="block px-5 py-2.5 transition hover:bg-slate-50">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-xs font-semibold text-slate-800">{ticket.title}</p>
                                                <Badge status={ticket.status} />
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-400">{ticket.code} · {formatDate(ticket.created_at)} · {formatCurrency(ticket.cost)}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="QR Code aset" description="Pindai untuk membuka detail" icon={QrCode} />
                        <div className="flex flex-col items-center p-5">
                            <div className="rounded-2xl border border-slate-200 p-3">
                                <img src={qrUrl} alt={`QR ${asset.code}`} className="size-40" />
                            </div>
                            <p className="mt-3 font-mono text-[11px] font-semibold text-slate-700">{asset.code}</p>
                            <div className="mt-3 flex gap-2">
                                <a href={qrUrl} target="_blank" rel="noreferrer" className={buttonClass('secondary', 'sm')}>
                                    <Download className="size-3.5" /> Unduh
                                </a>
                                <Link href={`/aset/labels?ids=${asset.id}`} target="_blank" className={buttonClass('secondary', 'sm')}>
                                    <Printer className="size-3.5" /> Label
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {canOperate && (
                        <Card>
                            <CardHeader title="Aksi cepat" description={isBulk ? 'Sesuaikan jumlah atau pindahkan aset' : 'Perbarui kondisi aset'} icon={Wrench} />
                            <div className="space-y-3 p-5">
                                {isBulk ? (
                                    <Button variant="primary" className="w-full" onClick={() => setStockOpen(true)} disabled={!isAdmin}>
                                        Ubah jumlah per status
                                    </Button>
                                ) : (
                                    <form onSubmit={updateStatus} className="space-y-3">
                                        <Select label="Status aset" value={statusForm.data.status} onChange={(e) => statusForm.setData('status', e.target.value)} error={statusForm.errors.status}>
                                            {Object.entries(statuses).filter(([key]) => key !== 'dihapuskan').map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </Select>
                                        <Button type="submit" variant="primary" className="w-full" loading={statusForm.processing}>
                                            Simpan status
                                        </Button>
                                    </form>
                                )}
                                {asset.room && (
                                    <Link href={`/mutasi?asset_id=${asset.id}`} className={buttonClass('secondary', 'sm', 'w-full')}>
                                        <ArrowLeftRight className="size-3.5" /> Mutasi ke ruangan lain
                                    </Link>
                                )}
                                <Link href={`/tiket?create=1&asset_id=${asset.id}`} className={buttonClass('secondary', 'sm', 'w-full')}>
                                    <AlertTriangle className="size-3.5" /> Laporkan kerusakan
                                </Link>
                            </div>
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Lokasi & penanggung jawab" icon={MapPin} />
                        <div className="p-5">
                            <p className="text-sm font-semibold text-slate-800">{asset.room?.name ?? 'Tanpa ruangan'}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{asset.room?.building?.name ?? 'Belum ditempatkan'} {asset.room?.floor ? `· Lantai ${asset.room.floor}` : ''}</p>
                            {asset.room?.responsible?.name && (
                                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                                        {asset.room.responsible.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                                    </span>
                                    PIC: {asset.room.responsible.name}
                                </p>
                            )}
                            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[10px]">
                                <span className="text-slate-500">Terdaftar sejak</span>
                                <span className="font-semibold text-slate-700">{formatDate(asset.created_at)}</span>
                            </div>
                        </div>
                    </Card>

                    {isAdmin && asset.status !== 'dihapuskan' && (
                        <Card>
                            <CardHeader title="Penghapusan aset" description="Rusak berat, hilang, atau dijual" icon={Trash2} />
                            <div className="p-5">
                                <p className="text-[11px] leading-relaxed text-slate-500">
                                    Aset tidak dihapus permanen — statusnya diubah menjadi dihapuskan dan tetap tersimpan untuk kebutuhan audit.
                                </p>
                                <Button variant="danger" size="sm" className="mt-3 w-full" onClick={() => setDisposeOpen(true)}>
                                    <Trash2 className="size-3.5" /> Hapuskan aset
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <Modal
                open={stockOpen}
                onClose={() => setStockOpen(false)}
                title="Ubah jumlah aset"
                description={`${asset.name} · total harus tetap ${summary.total} unit`}
                icon={Boxes}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setStockOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={updateStock} loading={stockForm.processing} disabled={totalStock !== summary.total}>Simpan jumlah</Button>
                    </>
                }
            >
                <form onSubmit={updateStock} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Input label="Tersedia" type="number" min="0" value={stockForm.data.qty_available} onChange={(e) => stockForm.setData('qty_available', e.target.value)} error={stockForm.errors.qty_available} />
                    <Input label="Dipakai" type="number" min="0" value={stockForm.data.qty_in_use} onChange={(e) => stockForm.setData('qty_in_use', e.target.value)} />
                    <Input label="Rusak" type="number" min="0" value={stockForm.data.qty_damaged} onChange={(e) => stockForm.setData('qty_damaged', e.target.value)} />
                    <Input label="Perbaikan" type="number" min="0" value={stockForm.data.qty_repair} onChange={(e) => stockForm.setData('qty_repair', e.target.value)} />
                    <Input label="Hilang" type="number" min="0" value={stockForm.data.qty_lost} onChange={(e) => stockForm.setData('qty_lost', e.target.value)} />
                    <div className={cn('rounded-xl p-3', totalStock === summary.total ? 'bg-emerald-50' : 'bg-rose-50')}>
                        <p className="text-[10px] font-medium text-slate-500">Total saat ini</p>
                        <p className={cn('tabular text-xl font-bold', totalStock === summary.total ? 'text-emerald-700' : 'text-rose-700')}>{totalStock}</p>
                        <p className="text-[9px] text-slate-400">Harus {summary.total} unit</p>
                    </div>
                    <Textarea label="Catatan perubahan" wrapperClass="col-span-2 sm:col-span-3" rows={2} value={stockForm.data.note} onChange={(e) => stockForm.setData('note', e.target.value)} placeholder="Alasan perubahan jumlah, misalnya hasil pengecekan…" />
                    {stockForm.errors.qty_available && <p className="col-span-full text-[11px] text-rose-600">{stockForm.errors.qty_available}</p>}
                </form>
            </Modal>

            <Modal
                open={disposeOpen}
                onClose={() => setDisposeOpen(false)}
                title="Hapuskan aset"
                description={`${asset.name} (${asset.code})`}
                icon={Trash2}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setDisposeOpen(false)}>Batal</Button>
                        <Button variant="danger" size="sm" onClick={dispose} loading={disposeForm.processing} disabled={!disposeForm.data.reason}>Hapuskan aset</Button>
                    </>
                }
            >
                <Textarea
                    label="Alasan penghapusan"
                    required
                    rows={3}
                    value={disposeForm.data.reason}
                    onChange={(e) => disposeForm.setData('reason', e.target.value)}
                    error={disposeForm.errors.reason}
                    placeholder="Contoh: Rusak berat dan tidak ekonomis untuk diperbaiki."
                />
                <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-700">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    Tindakan ini tercatat di log aktivitas. Aset tetap dapat dilihat pada riwayat dan dapat dipulihkan oleh admin.
                </div>
            </Modal>

            <ConfirmDialog
                open={restoreConfirm}
                onClose={() => setRestoreConfirm(false)}
                onConfirm={restore}
                title="Pulihkan aset?"
                description={`${asset.name} akan dikembalikan ke daftar aset aktif dengan status tersedia.`}
                confirmLabel="Pulihkan aset"
                danger={false}
            />
        </AppLayout>
    );
}
