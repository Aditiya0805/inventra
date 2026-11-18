import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    Boxes,
    Building2,
    CalendarDays,
    Download,
    DoorOpen,
    Layers,
    MapPin,
    Pencil,
    Printer,
    QrCode,
    User,
    Users,
    Wrench,
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader, StatCard } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import { formatDateTime, formatNumber, percentage } from '../../lib/utils';

export default function RoomShow({ room, assets, summary, byCategory, bookings, tickets, mutations, qrUrl }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;

    const seats = assets
        .filter((asset) => asset.category?.slug === 'kursi')
        .reduce((acc, asset) => {
            if (asset.stock) {
                acc.total += asset.stock.qty_in_use + asset.stock.qty_available + asset.stock.qty_damaged + asset.stock.qty_repair + asset.stock.qty_lost;
                acc.dipakai += asset.stock.qty_in_use;
                acc.tersedia += asset.stock.qty_available;
                acc.rusak += asset.stock.qty_damaged;
            } else {
                acc.total += 1;
                acc[asset.status] = (acc[asset.status] ?? 0) + 1;
            }
            return acc;
        }, { total: 0, dipakai: 0, tersedia: 0, rusak: 0 });

    const assetQty = (asset) => {
        if (asset.stock) {
            return asset.stock.qty_in_use + asset.stock.qty_available + asset.stock.qty_damaged + asset.stock.qty_repair + asset.stock.qty_lost;
        }
        return 1;
    };

    return (
        <AppLayout title={room.name} subtitle={`${room.building?.name} · Lantai ${room.floor}`}>
            <Head title={room.name} />

            <PageHeader
                backHref="/ruangan"
                title={room.name}
                badge={<Badge status={room.display_status} />}
                description={`${room.code} · ${room.type_label} · ${room.building?.name}, lantai ${room.floor}`}
                actions={
                    <>
                        <Link href={`/aset/labels?room_id=${room.id}`} target="_blank" className={buttonClass('secondary', 'md')}>
                            <Printer className="size-4" /> Label Aset
                        </Link>
                        <Link href={`/tiket?create=1&room_id=${room.id}`} className={buttonClass('secondary', 'md')}>
                            <AlertTriangle className="size-4" /> Laporkan Kerusakan
                        </Link>
                        {isAdmin && (
                            <Link href={`/ruangan/${room.id}/edit`} className={buttonClass('primary', 'md')}>
                                <Pencil className="size-4" /> Ubah Ruangan
                            </Link>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Unit Aset" value={formatNumber(summary.total)} hint={`${assets.length} jenis aset`} icon={Boxes} tone="brand" />
                <StatCard label="Tersedia" value={formatNumber(summary.tersedia)} hint="Siap digunakan" icon={DoorOpen} tone="emerald" />
                <StatCard label="Rusak" value={formatNumber(summary.rusak)} hint="Perlu perbaikan" icon={AlertTriangle} tone="rose" />
                <StatCard label="Perbaikan" value={formatNumber(summary.perbaikan)} hint="Sedang ditangani" icon={Wrench} tone="amber" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <Card>
                        <CardHeader title="Informasi ruangan" description="Detail fasilitas dan penanggung jawab" icon={DoorOpen} />
                        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: Building2, label: 'Gedung', value: room.building?.name },
                                { icon: Layers, label: 'Lantai', value: `Lantai ${room.floor}` },
                                { icon: MapPin, label: 'Jenis ruangan', value: room.type_label },
                                { icon: Users, label: 'Kapasitas', value: `${room.capacity} orang` },
                                { icon: User, label: 'Penanggung jawab', value: room.responsible?.name ?? 'Belum ditentukan' },
                                { icon: Boxes, label: 'Status ruangan', value: room.status_label },
                            ].map((item) => (
                                <div key={item.label} className="flex items-start gap-2.5">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><item.icon className="size-3.5" /></span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400">{item.label}</p>
                                        <p className="truncate text-xs font-semibold text-slate-800">{item.value ?? '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {room.notes && <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">{room.notes}</div>}
                    </Card>

                    <Card>
                        <CardHeader
                            title="Aset di ruangan ini"
                            description={`${assets.length} jenis aset terdata`}
                            icon={Boxes}
                            action={<Link href={`/aset?room_id=${room.id}`} className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">Buka di data aset →</Link>}
                        />
                        {assets.length === 0 ? (
                            <EmptyState icon={Boxes} title="Belum ada aset" description="Tambahkan aset melalui menu Data Aset dan pilih ruangan ini." />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-5 py-2.5 font-semibold">Aset</th>
                                            <th className="px-3 py-2.5 font-semibold">Kategori</th>
                                            <th className="px-3 py-2.5 text-center font-semibold">Jumlah</th>
                                            <th className="px-3 py-2.5 font-semibold">Status</th>
                                            <th className="px-5 py-2.5 text-right font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {assets.map((asset) => (
                                            <tr key={asset.id} className="transition hover:bg-slate-50/60">
                                                <td className="px-5 py-2.5">
                                                    <p className="font-semibold text-slate-800">{asset.name}</p>
                                                    <p className="font-mono text-[10px] text-slate-400">{asset.code}</p>
                                                </td>
                                                <td className="px-3 py-2.5 text-slate-500">{asset.category?.name}</td>
                                                <td className="tabular px-3 py-2.5 text-center font-semibold text-slate-700">
                                                    {formatNumber(assetQty(asset))}
                                                    {asset.stock && <span className="ml-1 text-[9px] font-normal text-slate-400">unit</span>}
                                                </td>
                                                <td className="px-3 py-2.5"><Badge status={asset.status} /></td>
                                                <td className="px-5 py-2.5 text-right">
                                                    <Link href={`/aset/${asset.id}`} className="text-[10px] font-semibold text-brand-700 hover:text-brand-800">Detail</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <div className="grid gap-5 md:grid-cols-2">
                        <Card>
                            <CardHeader title="Jadwal mendatang" description="Pemesanan ruangan" icon={CalendarDays} />
                            <div className="divide-y divide-slate-50">
                                {bookings.length === 0 && <p className="px-5 py-8 text-center text-xs text-slate-400">Belum ada jadwal.</p>}
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="px-5 py-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-xs font-semibold text-slate-800">{booking.title}</p>
                                            <Badge status={booking.status} />
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-slate-500">{formatDateTime(booking.starts_at)} – {formatDateTime(booking.ends_at)}</p>
                                        <p className="text-[10px] text-slate-400">{booking.user?.name}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Tiket kerusakan" description="Laporan terkait ruangan ini" icon={Wrench} />
                            <div className="divide-y divide-slate-50">
                                {tickets.length === 0 && <p className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada tiket kerusakan.</p>}
                                {tickets.map((ticket) => (
                                    <Link key={ticket.id} href={`/tiket/${ticket.id}`} className="block px-5 py-3 transition hover:bg-slate-50">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-xs font-semibold text-slate-800">{ticket.title}</p>
                                            <Badge status={ticket.status} />
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-slate-400">{ticket.code} · {ticket.reporter?.name} · {formatDateTime(ticket.created_at)}</p>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="QR ruangan" description="Pindai untuk membuka halaman ini" icon={QrCode} />
                        <div className="flex flex-col items-center p-5">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <img src={qrUrl} alt={`QR ${room.name}`} className="size-40" />
                            </div>
                            <p className="mt-3 font-mono text-[11px] font-semibold text-slate-700">{room.code}</p>
                            <p className="mt-0.5 text-center text-[10px] text-slate-400">{room.name} · {room.building?.name}</p>
                            <a href={qrUrl} target="_blank" rel="noreferrer" className={buttonClass('secondary', 'sm', 'mt-3')}>
                                <Download className="size-3.5" /> Unduh QR
                            </a>
                        </div>
                    </Card>

                    {seats.total > 0 && (
                        <Card>
                            <CardHeader title="Ringkasan kursi" description={`${seats.total} kursi di ruangan ini`} icon={Users} />
                            <div className="space-y-3 p-5">
                                {[
                                    ['Dipakai', seats.dipakai, 'bg-blue-500'],
                                    ['Tersedia', seats.tersedia, 'bg-emerald-500'],
                                    ['Rusak', seats.rusak, 'bg-rose-500'],
                                ].map(([label, value, color]) => (
                                    <div key={label}>
                                        <div className="mb-1 flex justify-between text-[11px]">
                                            <span className="text-slate-500">{label}</span>
                                            <span className="tabular font-semibold text-slate-800">{value} <span className="font-normal text-slate-400">({percentage(value, seats.total)}%)</span></span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage(value, seats.total)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Komposisi aset" description="Berdasarkan kategori" icon={Layers} />
                        <div className="space-y-3 p-5">
                            {byCategory.length === 0 && <p className="text-xs text-slate-400">Belum ada aset.</p>}
                            {byCategory.map((category) => (
                                <div key={category.name}>
                                    <div className="mb-1 flex justify-between text-[11px]">
                                        <span className="text-slate-500">{category.name}</span>
                                        <span className="tabular font-semibold text-slate-800">{formatNumber(category.total)}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${percentage(category.total, summary.total)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {mutations.length > 0 && (
                        <Card>
                            <CardHeader title="Mutasi terakhir" description="Aset masuk ke ruangan ini" icon={ArrowLeftRight} />
                            <div className="divide-y divide-slate-50">
                                {mutations.map((mutation) => (
                                    <div key={mutation.id} className="px-5 py-2.5">
                                        <p className="text-xs font-semibold text-slate-800">{mutation.quantity}× {mutation.asset?.name}</p>
                                        <p className="text-[10px] text-slate-400">Dari {mutation.from_room?.name ?? '—'} · {formatDateTime(mutation.moved_at)}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
