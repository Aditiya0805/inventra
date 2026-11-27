import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    ImagePlus,
    Plus,
    RotateCcw,
    Search,
    UserCheck,
    Wrench,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import { Input, Select, Textarea } from '../../Components/Form';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import { cn, compressImage, formatCurrency, formatDate, formatNumber, timeAgo } from '../../lib/utils';

const URGENCY_ACCENT = {
    rendah: 'border-l-slate-300',
    sedang: 'border-l-amber-400',
    tinggi: 'border-l-rose-500',
};

export default function TicketsIndex({
    tickets,
    filters,
    counts,
    statuses,
    urgencies,
    assets,
    rooms,
    technicians,
    stats,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const canReport = user?.role !== 'viewer';

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const [open, setOpen] = useState(params.get('create') === '1');
    const [photoPreview, setPhotoPreview] = useState(null);

    const form = useForm({
        asset_id: '',
        room_id: params.get('room_id') ?? '',
        title: '',
        description: '',
        urgency: 'sedang',
        photo: null,
    });

    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            form.setData('photo', compressed);
            setPhotoPreview(URL.createObjectURL(compressed));
        } catch {
            form.setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        form.setData('photo', null);
        setPhotoPreview(null);
    };

    const applyFilter = (key, value) => {
        router.get('/tiket', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetFilters = () => router.get('/tiket', {}, { preserveState: true, preserveScroll: true });

    const submit = (event) => {
        event.preventDefault();
        form.post('/tiket', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setPhotoPreview(null);
                form.reset('asset_id', 'room_id', 'title', 'description', 'photo');
            },
        });
    };

    const total = Object.values(counts ?? {}).reduce((sum, value) => sum + Number(value), 0);

    return (
        <AppLayout title="Tiket Kerusakan" subtitle={`${tickets.length} tiket ditampilkan`}>
            <Head title="Tiket Kerusakan" />

            <PageHeader
                title="Tiket Kerusakan"
                description="Laporkan kerusakan aset atau ruangan dan pantau proses perbaikannya."
                actions={
                    <>
                        <button type="button" onClick={resetFilters} className={buttonClass('secondary', 'md')}>
                            <RotateCcw className="size-4" /> Reset
                        </button>
                        {canReport && (
                            <Button onClick={() => setOpen(true)}>
                                <Plus className="size-4" /> Laporkan Kerusakan
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Tiket Terbuka" value={formatNumber(stats.open)} hint={`${total} tiket keseluruhan`} icon={Wrench} tone="amber" />
                <StatCard label="Prioritas Tinggi" value={formatNumber(stats.urgent)} hint="Masih dalam penanganan" icon={AlertTriangle} tone="rose" />
                <StatCard label="Selesai Bulan Ini" value={formatNumber(stats.done_month)} hint="Perbaikan tuntas" icon={CheckCircle2} tone="emerald" />
                <StatCard label="Biaya Bulan Ini" value={formatCurrency(stats.cost_month, true)} hint="Total biaya perbaikan" icon={Clock} tone="violet" />
            </div>

            <Card className="mt-5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            defaultValue={filters.q}
                            placeholder="Cari kode, judul, aset, atau deskripsi…"
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
                        {Object.entries(statuses).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.urgency ?? ''}
                        onChange={(event) => applyFilter('urgency', event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
                    >
                        <option value="">Semua urgensi</option>
                        {Object.entries(urgencies).map(([key, label]) => (
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
                        Laporan saya
                    </label>
                    {user?.role === 'teknisi' && (
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                            <input
                                type="checkbox"
                                checked={Boolean(filters.technician)}
                                onChange={(event) => applyFilter('technician', event.target.checked ? 1 : '')}
                                className="size-3.5 rounded border-slate-300 text-brand-700 focus:ring-brand-500/30"
                            />
                            Ditugaskan ke saya
                        </label>
                    )}
                </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
                {tickets.length === 0 ? (
                    <EmptyState
                        icon={Wrench}
                        title="Tidak ada tiket kerusakan"
                        description="Laporan kerusakan yang masuk akan tampil di sini."
                        action={canReport && <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-3.5" /> Laporkan Kerusakan</Button>}
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {tickets.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/tiket/${ticket.id}`}
                                className={cn(
                                    'block border-l-4 px-5 py-3.5 transition hover:bg-slate-50/80',
                                    URGENCY_ACCENT[ticket.urgency] ?? 'border-l-slate-200',
                                )}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[10px] text-slate-400">{ticket.code}</span>
                                            <Badge status={ticket.status} />
                                            <Badge status={ticket.urgency} />
                                        </div>
                                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">{ticket.title}</p>
                                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{ticket.description}</p>
                                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                                            <span>{ticket.asset?.name ?? 'Tanpa aset'} {ticket.asset?.code ? `(${ticket.asset.code})` : ''}</span>
                                            <span>·</span>
                                            <span>{ticket.room?.name ?? 'Tanpa ruangan'}</span>
                                            <span>·</span>
                                            <span>Pelapor: {ticket.reporter?.name ?? '—'}</span>
                                            <span>·</span>
                                            <span className={ticket.technician ? 'text-brand-600' : ''}>
                                                Teknisi: {ticket.technician?.name ?? 'Belum ditugaskan'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-[10px] text-slate-400">{formatDate(ticket.created_at)}</p>
                                        <p className="text-[10px] text-slate-400">{timeAgo(ticket.created_at)}</p>
                                        {Number(ticket.cost) > 0 && (
                                            <p className="mt-1 text-[10px] font-semibold text-slate-500">{formatCurrency(ticket.cost)}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><UserCheck className="size-3" /> Menampilkan maksimal 200 tiket terbaru sesuai filter.</span>
                    <span>{tickets.length} tiket</span>
                </div>
            </Card>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Laporkan kerusakan"
                description="Ceritakan kerusakan yang ditemukan agar teknisi dapat menindaklanjuti."
                icon={Wrench}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Kirim laporan</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3">
                    <Select
                        label="Aset yang rusak"
                        value={form.data.asset_id}
                        onChange={(event) => form.setData('asset_id', event.target.value)}
                        error={form.errors.asset_id}
                        placeholder="Tidak terkait aset tertentu"
                        hint="Pilih aset atau ruangan — minimal salah satu."
                    >
                        {assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.code}) — {asset.room?.name ?? 'tanpa ruangan'}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Ruangan"
                        value={form.data.room_id}
                        onChange={(event) => form.setData('room_id', event.target.value)}
                        error={form.errors.room_id}
                        placeholder="Tidak terkait ruangan tertentu"
                    >
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name} — {room.building?.name}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Judul laporan"
                        required
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        error={form.errors.title}
                        placeholder="Contoh: Proyektor kelas XII tidak menyala"
                    />

                    <Textarea
                        label="Deskripsi kerusakan"
                        required
                        rows={4}
                        value={form.data.description}
                        onChange={(event) => form.setData('description', event.target.value)}
                        error={form.errors.description}
                        placeholder="Jelaskan gejala, lokasi, dan kondisi terkini…"
                    />

                    <Select
                        label="Tingkat urgensi"
                        required
                        value={form.data.urgency}
                        onChange={(event) => form.setData('urgency', event.target.value)}
                        error={form.errors.urgency}
                    >
                        {Object.entries(urgencies).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Select>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Foto kerusakan</label>
                        {photoPreview ? (
                            <div className="relative overflow-hidden rounded-xl border border-slate-200">
                                <img src={photoPreview} alt="Pratinjau kerusakan" className="max-h-48 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 rounded-lg bg-slate-900/70 p-1.5 text-white transition hover:bg-slate-900"
                                    title="Hapus foto"
                                >
                                    <X className="size-3.5" />
                                </button>
                                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-600">
                                    <span className="truncate">{form.data.photo?.name}</span>
                                    <span className="ml-2 shrink-0 font-mono text-[9px] text-slate-400">
                                        {form.data.photo ? `${(form.data.photo.size / 1024).toFixed(0)} KB` : ''}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-xs text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40">
                                <ImagePlus className="size-4 text-brand-600" />
                                <span className="truncate">Pilih foto bukti kerusakan (JPG, PNG, WEBP)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        )}
                        {form.errors.photo && <p className="mt-1 text-[11px] font-medium text-rose-600">{form.errors.photo}</p>}
                    </div>

                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] text-amber-700">
                        Laporan akan diteruskan ke admin sarana prasarana dan teknisi. Anda dapat memantau statusnya di halaman ini.
                    </p>
                </form>
            </Modal>
        </AppLayout>
    );
}
