import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, FileUp, Info, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import PageHeader from '../../Components/PageHeader';
import { formatNumber } from '../../lib/utils';

export default function AssetImport({ categories, importResult }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const { data, setData, post, processing, errors, progress } = useForm({ file: null });

    const pick = (file) => {
        if (!file) return;
        setData('file', file);
        setFileName(file.name);
    };

    const submit = (event) => {
        event.preventDefault();
        post('/aset/import', { forceFormData: true, preserveScroll: true });
    };

    const result = importResult;

    return (
        <AppLayout title="Impor Aset" subtitle="Excel / CSV">
            <Head title="Impor Aset" />

            <PageHeader
                backHref="/aset"
                title="Impor Data Aset"
                description="Tambahkan banyak aset sekaligus menggunakan template Excel atau CSV yang telah disediakan."
                actions={
                    <a href="/aset/template" className={buttonClass('secondary', 'md')}>
                        <Download className="size-4" /> Unduh Template
                    </a>
                }
            />

            {result && (
                <Card className="mb-5 overflow-hidden">
                    <div className={`flex items-center gap-3 px-5 py-4 ${result.failed > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                        <span className={`grid size-10 place-items-center rounded-xl ${result.failed > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {result.failed > 0 ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Impor selesai</p>
                            <p className="text-xs text-slate-600">
                                <span className="font-semibold text-emerald-700">{formatNumber(result.success)} aset berhasil</span>
                                {result.failed > 0 && <span className="ml-2 font-semibold text-rose-600">{result.failed} baris gagal</span>}
                            </p>
                        </div>
                        <Link href="/aset" className={buttonClass('secondary', 'sm', 'ml-auto')}>Lihat data aset</Link>
                    </div>
                    {result.errors?.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border-t border-amber-100 px-5 py-3 scrollbar-thin">
                            <p className="mb-1.5 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Detail kesalahan</p>
                            <ul className="space-y-1">
                                {result.errors.map((error, index) => (
                                    <li key={index} className="text-[11px] text-rose-600">• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            )}

            <div className="grid gap-5 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader title="Unggah berkas" description="Format .xlsx, .xls, atau .csv (maksimal 10 MB)" icon={FileUp} />
                        <form onSubmit={submit} className="p-5">
                            <div
                                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setDragging(false);
                                    pick(event.dataTransfer.files?.[0]);
                                }}
                                onClick={() => inputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
                                    dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/30'
                                }`}
                            >
                                <span className="grid size-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                                    <UploadCloud className="size-6" />
                                </span>
                                <p className="mt-4 text-sm font-semibold text-slate-800">
                                    {fileName ? fileName : 'Tarik berkas ke sini atau klik untuk memilih'}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">Pastikan kolom Nama dan Kategori sesuai template.</p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(event) => pick(event.target.files?.[0])}
                                />
                            </div>

                            {errors.file && <p className="mt-2 text-[11px] font-medium text-rose-600">{errors.file}</p>}

                            {progress && (
                                <div className="mt-4">
                                    <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                                        <span>Mengunggah…</span><span>{progress.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress.percentage}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <button type="submit" disabled={processing || !data.file} className={buttonClass('primary', 'md')}>
                                    <FileSpreadsheet className="size-4" /> {processing ? 'Mengimpor…' : 'Mulai Impor'}
                                </button>
                                {data.file && (
                                    <button
                                        type="button"
                                        className={buttonClass('ghost', 'md')}
                                        onClick={() => { setData('file', null); setFileName(null); }}
                                    >
                                        <X className="size-4" /> Batalkan
                                    </button>
                                )}
                                <a href="/aset/template" className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800">
                                    <Download className="size-3.5" /> Template impor
                                </a>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Panduan impor" description="Ikuti langkah berikut" icon={Info} />
                        <div className="space-y-4 p-5">
                            {[
                                ['Unduh template', 'Gunakan file template resmi agar susunan kolom sesuai.'],
                                ['Isi data aset', 'Satu baris mewakili satu lot aset massal atau satu unit aset individual.'],
                                ['Gunakan nama kategori', 'Kategori harus sudah terdaftar di Pengaturan → Kategori.'],
                                ['Periksa hasil', 'Baris yang gagal akan ditampilkan beserta alasannya untuk diperbaiki.'],
                            ].map(([title, text], index) => (
                                <div key={title} className="flex gap-3">
                                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">{index + 1}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">{title}</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Kategori tersedia" description={`${categories.length} kategori terdaftar`} />
                        <div className="flex flex-wrap gap-1.5 p-5">
                            {categories.map((category) => (
                                <span key={category.id} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                                    {category.name}
                                    <span className="ml-1 text-slate-400">{category.tracking_type === 'bulk' ? '· massal' : '· unit'}</span>
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
