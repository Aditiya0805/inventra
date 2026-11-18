import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    FileDiff,
    ListChecks,
    Package,
    Save,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, CardHeader, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import { ConfirmDialog } from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import { cn, formatDate, formatDateTime, formatNumber } from '../../lib/utils';

export default function OpnameShow({ opname, items, summary }) {
    const readonly = opname.status === 'selesai';
    const [rows, setRows] = useState(() =>
        items.map((item) => ({
            id: item.id,
            asset: item.asset,
            system_qty: Number(item.system_qty),
            counted_qty: String(item.counted_qty ?? 0),
            note: item.note ?? '',
        })),
    );
    const [query, setQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmFinalize, setConfirmFinalize] = useState(false);

    const filteredRows = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return rows;
        return rows.filter((row) =>
            [row.asset?.name, row.asset?.code, row.asset?.category?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [rows, query]);

    const totals = useMemo(() => {
        return rows.reduce(
            (acc, row) => {
                const counted = Number(row.counted_qty || 0);
                acc.system += row.system_qty;
                acc.counted += counted;
                acc.difference += counted - row.system_qty;
                if (counted !== row.system_qty) acc.different += 1;
                return acc;
            },
            { system: 0, counted: 0, difference: 0, different: 0 },
        );
    }, [rows]);

    const updateRow = (id, key, value) => {
        setRows((previous) => previous.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    };

    const payload = (finalize) => ({
        items: rows.map((row) => ({
            id: row.id,
            counted_qty: Number(row.counted_qty || 0),
            note: row.note || null,
        })),
        finalize,
    });

    const save = () => {
        setSaving(true);
        router.put(`/opname/${opname.id}`, payload(false), {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const finalize = () => {
        router.put(`/opname/${opname.id}`, payload(true), {
            preserveScroll: true,
            onFinish: () => setConfirmFinalize(false),
        });
    };

    const differenceTone = (difference) =>
        difference === 0 ? 'text-slate-400' : difference > 0 ? 'text-emerald-600' : 'text-rose-600';

    return (
        <AppLayout title={`Opname ${opname.code}`} subtitle={`${opname.room?.name ?? ''} · ${formatDate(opname.date)}`}>
            <Head title={`Stock Opname ${opname.code}`} />

            <PageHeader
                backHref="/opname"
                title={`Stock Opname ${opname.code}`}
                badge={<Badge status={opname.status} />}
                description={`${opname.room?.name ?? '—'} · ${opname.room?.building?.name ?? '—'} · Dilaksanakan ${formatDate(opname.date)} oleh ${opname.user?.name ?? '—'}`}
                actions={
                    !readonly && (
                        <>
                            <Button variant="secondary" onClick={save} loading={saving}>
                                <Save className="size-4" /> Simpan hasil
                            </Button>
                            <Button onClick={() => setConfirmFinalize(true)}>
                                <CheckCircle2 className="size-4" /> Selesaikan
                            </Button>
                        </>
                    )
                }
            />

            {opname.notes && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Catatan sesi: </span>
                    {opname.notes}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Jenis Aset" value={formatNumber(summary.items)} hint="Baris dalam opname" icon={ListChecks} tone="brand" />
                <StatCard label="Jumlah Sistem" value={formatNumber(totals.system)} hint={`Awal: ${formatNumber(summary.system)} unit`} icon={Package} tone="blue" />
                <StatCard label="Hasil Hitung" value={formatNumber(totals.counted)} hint={`${formatNumber(summary.counted)} unit saat dibuat`} icon={ClipboardCheck} tone="emerald" />
                <StatCard
                    label="Selisih"
                    value={`${totals.difference > 0 ? '+' : ''}${formatNumber(totals.difference)}`}
                    hint={`${formatNumber(totals.different)} aset berbeda`}
                    icon={FileDiff}
                    tone={totals.difference === 0 ? 'slate' : totals.difference > 0 ? 'emerald' : 'rose'}
                />
            </div>

            {!readonly && totals.different > 0 && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <p className="text-[11px] text-amber-800">
                        Terdapat <span className="font-semibold">{totals.different} aset</span> dengan jumlah fisik berbeda dari sistem.
                        Menyelesaikan opname akan menyesuaikan stok/status aset sesuai hasil hitung.
                    </p>
                </div>
            )}

            <Card className="mt-5 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Lembar hitung fisik</h3>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                            {readonly ? 'Sesi telah selesai dan tidak dapat diubah.' : 'Masukkan jumlah fisik aktual untuk setiap aset.'}
                        </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari aset atau kategori…"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-8.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                        />
                    </div>
                </div>

                {filteredRows.length === 0 ? (
                    <EmptyState icon={Package} title="Tidak ada aset" description="Tidak ada baris yang cocok dengan pencarian." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Aset</th>
                                    <th className="px-3 py-3 font-semibold">Kategori</th>
                                    <th className="px-3 py-3 text-center font-semibold">Jumlah Sistem</th>
                                    <th className="px-3 py-3 text-center font-semibold">Hasil Hitung Fisik</th>
                                    <th className="px-3 py-3 text-center font-semibold">Selisih</th>
                                    <th className="px-5 py-3 font-semibold">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRows.map((row) => {
                                    const difference = Number(row.counted_qty || 0) - row.system_qty;
                                    return (
                                        <tr key={row.id} className={cn('transition', !readonly && 'hover:bg-slate-50/60')}>
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-slate-800">{row.asset?.name ?? 'Aset dihapus'}</p>
                                                <p className="font-mono text-[10px] text-slate-400">{row.asset?.code}</p>
                                                {row.asset?.stock && (
                                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                                        Tersedia {row.asset.stock.qty_available} · dipakai {row.asset.stock.qty_in_use} · rusak {row.asset.stock.qty_damaged}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-slate-500">{row.asset?.category?.name ?? '—'}</td>
                                            <td className="tabular px-3 py-3 text-center font-semibold text-slate-700">{formatNumber(row.system_qty)}</td>
                                            <td className="px-3 py-3 text-center">
                                                {readonly ? (
                                                    <span className="tabular font-semibold text-slate-800">{formatNumber(row.counted_qty)}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.counted_qty}
                                                        onChange={(event) => updateRow(row.id, 'counted_qty', event.target.value)}
                                                        className="tabular mx-auto w-24 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:outline-none"
                                                    />
                                                )}
                                            </td>
                                            <td className="tabular px-3 py-3 text-center">
                                                <span className={cn('font-semibold', differenceTone(difference))}>
                                                    {difference > 0 ? '+' : ''}{formatNumber(difference)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                {readonly ? (
                                                    <span className="text-[11px] text-slate-500">{row.note || '—'}</span>
                                                ) : (
                                                    <input
                                                        value={row.note}
                                                        onChange={(event) => updateRow(row.id, 'note', event.target.value)}
                                                        placeholder="Catatan (opsional)"
                                                        className="w-full min-w-40 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px]">
                    <span className="text-slate-500">
                        {formatNumber(rows.length)} baris · sistem {formatNumber(totals.system)} unit · fisik {formatNumber(totals.counted)} unit
                    </span>
                    <span className={cn('font-semibold', differenceTone(totals.difference))}>
                        Selisih total: {totals.difference > 0 ? '+' : ''}{formatNumber(totals.difference)} unit
                    </span>
                </div>
            </Card>

            {!readonly && (
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={save} disabled={saving} className={buttonClass('secondary', 'md')}>
                        <Save className="size-4" /> Simpan draft
                    </button>
                    <Button onClick={() => setConfirmFinalize(true)}>
                        <CheckCircle2 className="size-4" /> Selesaikan opname
                    </Button>
                </div>
            )}

            <p className="mt-3 text-[10px] text-slate-400">
                Dibuat {formatDateTime(opname.created_at)} · {summary.different_items} aset tercatat berbeda saat sesi dibuat.
            </p>

            <ConfirmDialog
                open={confirmFinalize}
                onClose={() => setConfirmFinalize(false)}
                onConfirm={finalize}
                title="Selesaikan stock opname?"
                description={`Selisih ${totals.difference > 0 ? '+' : ''}${formatNumber(totals.difference)} unit akan diterapkan ke stok/status aset. Sesi yang selesai tidak dapat diubah lagi.`}
                confirmLabel="Ya, selesaikan"
                danger={totals.difference !== 0}
            />
        </AppLayout>
    );
}
