import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, DoorOpen, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import { Input, Select, Textarea } from '../../Components/Form';
import Modal from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import { cn, formatTime } from '../../lib/utils';

const pad = (value) => String(value).padStart(2, '0');
const dateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const shiftDate = (date, days) => {
    const copy = new Date(`${date}T12:00:00`);
    copy.setDate(copy.getDate() + days);
    return `${copy.getFullYear()}-${pad(copy.getMonth() + 1)}-${pad(copy.getDate())}`;
};

const STATUS_ACCENT = {
    disetujui: 'border-l-emerald-500 bg-emerald-50/60',
    menunggu: 'border-l-amber-500 bg-amber-50/60',
    ditolak: 'border-l-rose-400 bg-rose-50/50',
    dibatalkan: 'border-l-slate-300 bg-slate-50',
};

export default function BookingsIndex({ bookings, days, weekLabel, weekStart, pending, rooms, filterRoom, today }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;
    const [open, setOpen] = useState(false);

    const form = useForm({
        room_id: rooms[0]?.id ?? '',
        title: '',
        purpose: '',
        date: today,
        start_time: '08:00',
        end_time: '10:00',
    });

    const go = (date, roomId = filterRoom) => {
        router.get('/pemesanan', { date, room_id: roomId || undefined }, { preserveState: true, preserveScroll: true });
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/pemesanan', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset('title', 'purpose');
            },
        });
    };

    const updateStatus = (booking, status) => {
        router.put(`/pemesanan/${booking.id}/status`, { status }, { preserveScroll: true });
    };

    const bookingsForDay = (date) => bookings.filter((booking) => dateKey(booking.starts_at) === date);
    const weekCount = bookings.filter((booking) => booking.status === 'disetujui').length;

    return (
        <AppLayout title="Pemesanan Ruangan" subtitle={weekLabel}>
            <Head title="Pemesanan Ruangan" />

            <PageHeader
                title="Kalender Ruangan"
                description="Lihat ketersediaan ruangan dan ajukan pemesanan tanpa bentrok jadwal."
                actions={
                    <>
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            <button type="button" onClick={() => go(shiftDate(weekStart, -7))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><ChevronLeft className="size-4" /></button>
                            <span className="px-2 text-[11px] font-semibold text-slate-600">{weekLabel}</span>
                            <button type="button" onClick={() => go(shiftDate(weekStart, 7))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><ChevronRight className="size-4" /></button>
                        </div>
                        <button type="button" onClick={() => go(today)} className={buttonClass('secondary', 'md')}>Hari ini</button>
                        <button type="button" onClick={() => setOpen(true)} className={buttonClass('primary', 'md')}>
                            <Plus className="size-4" /> Buat Pemesanan
                        </button>
                    </>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                    value={filterRoom ?? ''}
                    onChange={(event) => go(weekStart, event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm focus:border-brand-400 focus:outline-none"
                >
                    <option value="">Semua ruangan</option>
                    {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">{weekCount} jadwal disetujui</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">{pending.length} menunggu persetujuan</span>
            </div>

            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-7 sm:divide-x sm:divide-y-0">
                    {days.map((day) => {
                        const items = bookingsForDay(day.date);
                        return (
                            <div key={day.date} className={cn('flex min-h-40 flex-col', day.is_today && 'bg-brand-50/40')}>
                                <div className={cn('flex items-center justify-between border-b border-slate-100 px-2.5 py-2', day.is_today && 'border-brand-100')}>
                                    <div>
                                        <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">{day.label}</p>
                                        <p className={cn('tabular text-lg font-bold', day.is_today ? 'text-brand-700' : 'text-slate-800')}>{day.day}</p>
                                    </div>
                                    {day.is_today && <span className="size-1.5 rounded-full bg-brand-500" />}
                                </div>
                                <div className="flex-1 space-y-1.5 p-1.5">
                                    {items.length === 0 && <p className="px-1 py-3 text-center text-[9px] text-slate-300">Kosong</p>}
                                    {items.map((booking) => (
                                        <div key={booking.id} className={cn('rounded-lg border-l-2 p-1.5', STATUS_ACCENT[booking.status])}>
                                            <p className="text-[9px] font-bold text-slate-500">{formatTime(booking.starts_at)}–{formatTime(booking.ends_at)}</p>
                                            <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight text-slate-800">{booking.title}</p>
                                            <p className="mt-0.5 truncate text-[9px] text-slate-500">{booking.room?.name}</p>
                                            <p className="truncate text-[9px] text-slate-400">{booking.user?.name}</p>
                                            {isAdmin && booking.status === 'menunggu' && (
                                                <div className="mt-1 flex gap-1">
                                                    <button type="button" onClick={() => updateStatus(booking, 'disetujui')} className="rounded bg-emerald-600 p-0.5 text-white" title="Setujui"><Check className="size-2.5" /></button>
                                                    <button type="button" onClick={() => updateStatus(booking, 'ditolak')} className="rounded bg-rose-500 p-0.5 text-white" title="Tolak"><X className="size-2.5" /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader title="Menunggu persetujuan" description={`${pending.length} pengajuan pemesanan`} icon={Clock} />
                    {pending.length === 0 ? (
                        <p className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada pengajuan yang menunggu.</p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {pending.map((booking) => (
                                <div key={booking.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                                    <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600"><CalendarDays className="size-4" /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-slate-800">{booking.title}</p>
                                        <p className="text-[10px] text-slate-500">{booking.room?.name} · {booking.user?.name} · {dateKey(booking.starts_at)} {formatTime(booking.starts_at)}–{formatTime(booking.ends_at)}</p>
                                    </div>
                                    {isAdmin ? (
                                        <div className="flex gap-1.5">
                                            <button type="button" onClick={() => updateStatus(booking, 'disetujui')} className={buttonClass('success', 'xs')}><Check className="size-3" /> Setujui</button>
                                            <button type="button" onClick={() => updateStatus(booking, 'ditolak')} className={buttonClass('secondary', 'xs')}>Tolak</button>
                                        </div>
                                    ) : (
                                        <Badge color="amber">Menunggu</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Ruangan & status" description="Kondisi saat ini" icon={DoorOpen} />
                    <div className="max-h-80 divide-y divide-slate-50 overflow-y-auto scrollbar-thin">
                        {rooms.map((room) => (
                            <Link key={room.id} href={`/ruangan/${room.id}`} className="flex items-center gap-2 px-5 py-2.5 transition hover:bg-slate-50">
                                <span className={cn('size-2 rounded-full', room.status === 'tersedia' ? 'bg-emerald-500' : room.status === 'perawatan' ? 'bg-amber-500' : 'bg-slate-400')} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-700">{room.name}</p>
                                    <p className="text-[10px] text-slate-400">{room.building?.name}</p>
                                </div>
                                <ChevronRightIcon />
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Buat pemesanan ruangan"
                description="Ajukan penggunaan ruangan pada tanggal dan jam tertentu."
                icon={CalendarDays}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                        <Button size="sm" onClick={submit} loading={form.processing}>Kirim pemesanan</Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-3">
                    <Select label="Ruangan" required value={form.data.room_id} onChange={(e) => form.setData('room_id', e.target.value)} error={form.errors.room_id}>
                        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name} — {room.building?.name}</option>)}
                    </Select>
                    <Input label="Judul kegiatan" required value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} error={form.errors.title} placeholder="Contoh: Rapat wali kelas" />
                    <Input label="Tanggal" type="date" required value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} error={form.errors.date} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Mulai" type="time" required value={form.data.start_time} onChange={(e) => form.setData('start_time', e.target.value)} error={form.errors.start_time} />
                        <Input label="Selesai" type="time" required value={form.data.end_time} onChange={(e) => form.setData('end_time', e.target.value)} error={form.errors.end_time} />
                    </div>
                    <Textarea label="Tujuan / keterangan" rows={2} value={form.data.purpose} onChange={(e) => form.setData('purpose', e.target.value)} error={form.errors.purpose} />
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        {isAdmin ? 'Sebagai admin, pemesanan langsung disetujui.' : 'Pemesanan akan menunggu persetujuan admin sarana prasarana.'}
                    </p>
                </form>
            </Modal>
        </AppLayout>
    );
}

function ChevronRightIcon() {
    return <ChevronRight className="size-3.5 text-slate-300" />;
}
