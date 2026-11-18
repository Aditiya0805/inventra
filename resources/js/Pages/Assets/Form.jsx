import { Head, Link, useForm } from '@inertiajs/react';
import { Boxes, ImagePlus, Info, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import { Checkbox, Input, Select, Textarea } from '../../Components/Form';
import PageHeader from '../../Components/PageHeader';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

export default function AssetForm({ asset, categories, rooms, statuses, selectedCategory }) {
    const isEdit = !!asset;
    const isBulkAsset = asset?.is_bulk || asset?.category?.tracking_type === 'bulk';
    const [preview, setPreview] = useState(asset?.photo_url ?? null);

    const form = useForm({
        name: asset?.name ?? '',
        code: asset?.code ?? '',
        category_id: asset?.category_id ?? selectedCategory ?? categories[0]?.id ?? '',
        room_id: asset?.room_id ?? '',
        brand: asset?.brand ?? '',
        model: asset?.model ?? '',
        serial_number: asset?.serial_number ?? '',
        acquisition_date: asset?.acquisition_date ? String(asset.acquisition_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        value: asset?.value ?? 0,
        funding_source: asset?.funding_source ?? 'BOS',
        status: asset?.status ?? 'tersedia',
        is_consumable: asset?.is_consumable ?? false,
        min_stock: asset?.min_stock ?? '',
        notes: asset?.notes ?? '',
        photo: null,
        qty_available: asset?.stock?.qty_available ?? 0,
        qty_in_use: asset?.stock?.qty_in_use ?? 0,
        qty_damaged: asset?.stock?.qty_damaged ?? 0,
        qty_repair: asset?.stock?.qty_repair ?? 0,
        qty_lost: asset?.stock?.qty_lost ?? 0,
        _method: isEdit ? 'put' : undefined,
    });

    const { data, setData, post, processing, errors } = form;
    const category = categories.find((item) => Number(item.id) === Number(data.category_id));
    const isBulk = isEdit ? isBulkAsset : category?.tracking_type === 'bulk';
    const totalQty = Number(data.qty_available) + Number(data.qty_in_use) + Number(data.qty_damaged) + Number(data.qty_repair) + Number(data.qty_lost);

    const submit = (event) => {
        event.preventDefault();
        post(isEdit ? `/aset/${asset.id}` : '/aset', { forceFormData: true });
    };

    const onPhoto = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData('photo', file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    return (
        <AppLayout title={isEdit ? 'Ubah Aset' : 'Tambah Aset'} subtitle={isEdit ? asset.name : 'Aset baru'}>
            <Head title={isEdit ? 'Ubah Aset' : 'Tambah Aset'} />

            <PageHeader
                backHref={isEdit ? `/aset/${asset.id}` : '/aset'}
                title={isEdit ? `Ubah ${asset.name}` : 'Tambah Aset'}
                description="Catat aset dengan lengkap agar pemantauan kondisi dan lokasi tetap akurat."
            />

            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <Card>
                        <CardHeader title="Informasi utama" description="Identitas aset dan lokasi penyimpanan" icon={Boxes} />
                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <Input label="Nama aset" required value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: Proyektor Epson EB-X06" autoFocus />
                            <Input label="Kode aset" value={data.code} onChange={(e) => setData('code', e.target.value)} error={errors.code} placeholder="Otomatis jika dikosongkan" hint="Biarkan kosong untuk dibuat otomatis." />
                            <Select label="Kategori" required value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} error={errors.category_id} hint={category ? `Pencatatan: ${category.tracking_type === 'bulk' ? 'massal / berdasarkan jumlah' : 'per unit'}` : undefined}>
                                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </Select>
                            <Select label="Ruangan" value={data.room_id} onChange={(e) => setData('room_id', e.target.value)} error={errors.room_id} placeholder="Tanpa ruangan / gudang">
                                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                            </Select>
                            {!isBulk && (
                                <Select label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                                    {Object.entries(statuses).filter(([key]) => key !== 'dihapuskan').map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                </Select>
                            )}
                            <div className={cn(isBulk ? 'sm:col-span-2' : '')}>
                                <Input label="Sumber dana" value={data.funding_source} onChange={(e) => setData('funding_source', e.target.value)} error={errors.funding_source} placeholder="BOS / Komite / Hibah" />
                            </div>
                            <Textarea label="Catatan" wrapperClass="sm:col-span-2" rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} error={errors.notes} placeholder="Keterangan tambahan, riwayat singkat, atau hal penting lainnya…" />
                        </div>
                    </Card>

                    {isBulk && (
                        <Card>
                            <CardHeader
                                title="Jumlah aset massal"
                                description={isEdit ? 'Ubah jumlah per status melalui halaman detail agar total tetap terjaga.' : 'Masukkan jumlah unit per status saat pencatatan awal.'}
                                icon={Boxes}
                                action={<span className="tabular rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">{formatNumber(totalQty)} unit</span>}
                            />
                            {isEdit ? (
                                <div className="p-5">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                        {[
                                            ['Tersedia', asset?.stock?.qty_available ?? 0],
                                            ['Dipakai', asset?.stock?.qty_in_use ?? 0],
                                            ['Rusak', asset?.stock?.qty_damaged ?? 0],
                                            ['Perbaikan', asset?.stock?.qty_repair ?? 0],
                                            ['Hilang', asset?.stock?.qty_lost ?? 0],
                                        ].map(([label, value]) => (
                                            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                                                <p className="text-[10px] text-slate-400">{label}</p>
                                                <p className="tabular text-lg font-bold text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[11px] text-slate-500">
                                        Perubahan jumlah per status dilakukan di halaman detail aset agar total unit tetap konsisten. Gunakan menu Mutasi untuk memindahkan unit antar ruangan.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                                    <Input label="Tersedia" type="number" min="0" value={data.qty_available} onChange={(e) => setData('qty_available', e.target.value)} error={errors.qty_available} />
                                    <Input label="Dipakai" type="number" min="0" value={data.qty_in_use} onChange={(e) => setData('qty_in_use', e.target.value)} error={errors.qty_in_use} />
                                    <Input label="Rusak" type="number" min="0" value={data.qty_damaged} onChange={(e) => setData('qty_damaged', e.target.value)} error={errors.qty_damaged} />
                                    <Input label="Dalam perbaikan" type="number" min="0" value={data.qty_repair} onChange={(e) => setData('qty_repair', e.target.value)} error={errors.qty_repair} />
                                    <Input label="Hilang" type="number" min="0" value={data.qty_lost} onChange={(e) => setData('qty_lost', e.target.value)} error={errors.qty_lost} />
                                    <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
                                        <p className="text-[10px] font-medium text-brand-600">Total unit</p>
                                        <p className="tabular mt-1 text-xl font-bold text-brand-800">{formatNumber(totalQty)}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Detail perolehan" description="Informasi merek, nilai, dan dokumen pendukung" icon={Info} />
                        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <Input label="Merek" value={data.brand} onChange={(e) => setData('brand', e.target.value)} error={errors.brand} placeholder="Epson" />
                            <Input label="Model" value={data.model} onChange={(e) => setData('model', e.target.value)} error={errors.model} placeholder="EB-X06" />
                            <Input label="Nomor seri" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} error={errors.serial_number} placeholder="SN-XXXX" />
                            <Input label="Tanggal perolehan" type="date" value={data.acquisition_date} onChange={(e) => setData('acquisition_date', e.target.value)} error={errors.acquisition_date} />
                            <Input label="Nilai per unit (Rp)" type="number" min="0" value={data.value} onChange={(e) => setData('value', e.target.value)} error={errors.value} hint={data.value ? formatCurrency(data.value) : undefined} />
                            <div className="flex flex-col justify-end gap-3">
                                <Checkbox
                                    id="consumable"
                                    label="Aset habis pakai"
                                    description="Tinta, kertas, dan sejenisnya"
                                    checked={data.is_consumable}
                                    onChange={(e) => setData('is_consumable', e.target.checked)}
                                />
                                {data.is_consumable && (
                                    <Input label="Stok minimum" type="number" min="0" value={data.min_stock} onChange={(e) => setData('min_stock', e.target.value)} error={errors.min_stock} />
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Foto aset" description="Opsional, maksimal 4 MB" icon={ImagePlus} />
                        <div className="p-5">
                            {preview ? (
                                <div className="relative overflow-hidden rounded-xl border border-slate-200">
                                    <img src={preview} alt="Pratinjau" className="aspect-[4/3] w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setPreview(null); setData('photo', null); }}
                                        className="absolute top-2 right-2 rounded-lg bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-600">
                                    <ImagePlus className="size-7" />
                                    <span className="text-[11px] font-medium">Pilih foto aset</span>
                                    <span className="text-[10px]">JPG, PNG, WEBP</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                                </label>
                            )}
                            {errors.photo && <p className="mt-1.5 text-[11px] text-rose-600">{errors.photo}</p>}
                            {preview && (
                                <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                                    Ganti foto
                                    <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                                </label>
                            )}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                {isBulk
                                    ? 'Aset massal dicatat per lot ruangan. Total unit tidak boleh berubah saat memperbarui status — gunakan mutasi atau pencatatan resmi untuk menambah/mengurangi.'
                                    : 'Aset individual memiliki satu kode unik dan dapat dipinjam, dipindahkan, serta dilaporkan kerusakannya secara terpisah.'}
                            </p>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <button type="submit" disabled={processing} className={buttonClass('primary', 'md', 'w-full')}>
                                <Save className="size-4" /> {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Aset'}
                            </button>
                            <Link href={isEdit ? `/aset/${asset.id}` : '/aset'} className={buttonClass('secondary', 'md', 'w-full')}>
                                Batal
                            </Link>
                        </div>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
