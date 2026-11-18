import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    Boxes,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock,
    DoorOpen,
    PackageOpen,
    Plus,
    QrCode,
    RotateCcw,
    Ticket,
    TrendingUp,
    Wrench,
} from 'lucide-react';
import AppLayout from '../Components/AppLayout';
import Badge from '../Components/Badge';
import Button, { buttonClass } from '../Components/Button';
import { Card, CardHeader, StatCard } from '../Components/Card';
import { CategoryBar, RoomStatusDonut, SeatDonut } from '../Components/Charts';
import PageHeader from '../Components/PageHeader';
import { cn, formatDateTime, formatNumber, formatTime, percentage } from '../lib/utils';

const SEAT_ROWS = [
    { key: 'dipakai', label: 'Dipakai', color: 'bg-blue-500' },
    { key: 'tersedia', label: 'Tidak dipakai', color: 'bg-emerald-500' },
    { key: 'rusak', label: 'Rusak', color: 'bg-rose-500' },
    { key: 'perbaikan', label: 'Perbaikan', color: 'bg-amber-500' },
];

function FilterBar({ filters, options }) {
    const update = (key, value) => {
        router.get('/dashboard', { ...filters, [key]: value || undefined, room_id: key === 'building_id' || key === 'floor' ? undefined : filters.room_id }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasFilter = filters.building_id || filters.floor || filters.room_id || filters.category_id;

    return (
        <Card className="mb-5 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="ml-1 hidden text-[11px] font-semibold text-slate-400 uppercase sm:block">Filter</span>
                <select
                    value={filters.building_id ?? ''}
                    onChange={(event) => update('building_id', event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none"
                >
                    <option value="">Semua gedung</option>
                    {options.buildings.map((building) => (
                        <option key={building.id} value={building.id}>{building.name}</option>
                    ))}
                </select>
                <select
                    value={filters.floor ?? ''}
                    onChange={(event) => update('floor', event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none"
                >
                    <option value="">Semua lantai</option>
                    {options.floors.map((floor) => (
                        <option key={floor} value={floor}>Lantai {floor}</option>
                    ))}
                </select>
                <select
                    value={filters.room_id ?? ''}
                    onChange={(event) => update('room_id', event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none"
                >
                    <option value="">Semua ruangan</option>
                    {options.rooms.map((room) => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </select>
                <select
                    value={filters.category_id ?? ''}
                    onChange={(event) => update('category_id', event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none"
                >
                    <option value="">Semua kategori</option>
                    {options.categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                {hasFilter ? (
                    <Link href="/dashboard" className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100">
                        <RotateCcw className="size-3" /> Reset filter
                    </Link>
                ) : (
                    <span className="ml-auto hidden items-center gap-1 text-[10px] text-slate-400 sm:flex">
                        <CheckCircle2 className="size-3 text-emerald-500" /> Data real-time
                    </span>
                )}
            </div>
        </Card>
    );
}

export default function Dashboard({ kpi, seats, devices, roomStatus, rooms, categoryChart, alerts, recentTickets, dueLoans, lowStocks, todayBookings, filters, filterOptions, threshold, today }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin;
    const seatPercent = percentage(seats.dipakai, seats.total);
    const damagedPercent = percentage(kpi.damaged, kpi.total_assets);

    return (
        <AppLayout title="Dashboard" subtitle={`Ringkasan aset · ${today}`}>
            <Head title="Dashboard" />

            <PageHeader
                title="Dashboard Monitoring"
                description={`Pantau kondisi aset dan fasilitas sekolah secara menyeluruh. Hari ini ${today}.`}
                actions={
                    <>
                        {isAdmin && (
                            <Link href="/aset/create" className={buttonClass('secondary', 'md')}>
                                <Plus className="size-4" /> Tambah Aset
                            </Link>
                        )}
                        <Link href="/tiket?create=1" className={buttonClass('primary', 'md')}>
                            <AlertTriangle className="size-4" /> Laporkan Kerusakan
                        </Link>
                    </>
                }
            />

            <FilterBar filters={filters} options={filterOptions} />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <StatCard
                    label="Ruangan"
                    value={formatNumber(kpi.rooms)}
                    hint={`${kpi.rooms_in_use} dipakai · ${kpi.rooms_available} tersedia`}
                    icon={DoorOpen}
                    tone="brand"
                />
                <StatCard
                    label="Total Aset"
                    value={formatNumber(kpi.total_assets)}
                    hint={`${formatNumber(kpi.available_assets)} unit tersedia`}
                    icon={Boxes}
                    tone="blue"
                />
                <StatCard
                    label="Aset Rusak"
                    value={formatNumber(kpi.damaged)}
                    hint={`${damagedPercent}% dari total aset`}
                    icon={AlertTriangle}
                    tone="rose"
                />
                <StatCard
                    label="Dalam Perbaikan"
                    value={formatNumber(kpi.in_repair)}
                    hint="Menunggu teknisi selesai"
                    icon={Wrench}
                    tone="amber"
                />
                <StatCard
                    label="Tiket Aktif"
                    value={formatNumber(kpi.open_tickets)}
                    hint={`${kpi.active_loans} peminjaman berjalan`}
                    icon={Ticket}
                    tone="violet"
                    className="col-span-2 lg:col-span-1"
                />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Kondisi kursi sekolah"
                        description="Distribusi seluruh kursi berdasarkan status pemakaian"
                        icon={ClipboardList}
                        action={<Badge color="emerald" dot>{seatPercent}% terpakai</Badge>}
                    />
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        <SeatDonut seats={seats} />
                        <div className="flex flex-col justify-center gap-3">
                            {SEAT_ROWS.map((row) => {
                                const value = seats[row.key] ?? 0;
                                return (
                                    <div key={row.key}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                <span className={cn('size-2 rounded-full', row.color)} /> {row.label}
                                            </span>
                                            <span className="tabular text-xs font-bold text-slate-900">
                                                {formatNumber(value)}
                                                <span className="ml-1 font-normal text-slate-400">({percentage(value, seats.total)}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div className={cn('h-full rounded-full', row.color)} style={{ width: `${percentage(value, seats.total)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="mt-1 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                <span className="text-[11px] font-medium text-slate-500">Total kursi terdata</span>
                                <span className="tabular text-sm font-bold text-slate-900">{formatNumber(seats.total)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Status ruangan" description="Kondisi ruangan saat ini" icon={DoorOpen} />
                    <div className="p-5">
                        <RoomStatusDonut status={roomStatus} />
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                                ['Tersedia', roomStatus.tersedia, 'bg-emerald-500'],
                                ['Dipakai', roomStatus.dipakai, 'bg-blue-500'],
                                ['Dipesan', roomStatus.dipesan, 'bg-amber-500'],
                                ['Perawatan', (roomStatus.perawatan ?? 0) + (roomStatus.ditutup ?? 0), 'bg-slate-400'],
                            ].map(([label, value, color]) => (
                                <div key={label} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                                    <span className={cn('size-1.5 rounded-full', color)} />
                                    <span className="text-[10px] text-slate-500">{label}</span>
                                    <span className="tabular ml-auto text-[11px] font-bold text-slate-800">{value ?? 0}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/ruangan" className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50">
                            Lihat semua ruangan <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </Card>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Jumlah aset per kategori"
                        description="Total unit dan jumlah yang rusak"
                        icon={Boxes}
                        action={<Link href="/aset" className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">Kelola aset →</Link>}
                    />
                    <div className="p-4 pb-2">
                        <CategoryBar data={categoryChart} />
                    </div>
                </Card>

                <Card>
                    <CardHeader
                        title="Peringatan aset"
                        description={`Ambang batas kerusakan ${threshold}%`}
                        icon={AlertTriangle}
                        action={<Badge color="rose">{alerts.length}</Badge>}
                    />
                    <div className="divide-y divide-slate-50">
                        {alerts.length === 0 && (
                            <p className="px-5 py-10 text-center text-xs text-slate-400">Tidak ada ruangan yang melewati ambang batas. 👍</p>
                        )}
                        {alerts.map((alert) => (
                            <Link key={alert.id} href={`/ruangan/${alert.id}`} className="block px-5 py-3 transition hover:bg-slate-50">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">{alert.name}</p>
                                        <p className="mt-0.5 text-[10px] text-slate-500">{alert.building} · Lantai {alert.floor}</p>
                                    </div>
                                    <Badge color="rose">{alert.percentage}%</Badge>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(alert.percentage, 100)}%` }} />
                                </div>
                                <p className="mt-1 text-[10px] text-slate-400">{alert.damaged} dari {alert.asset_qty} unit rusak</p>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Tiket kerusakan terbaru"
                        description="Laporan yang perlu ditindaklanjuti"
                        icon={Ticket}
                        action={<Link href="/tiket" className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">Semua tiket →</Link>}
                    />
                    <div className="divide-y divide-slate-50">
                        {recentTickets.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">Belum ada tiket kerusakan.</p>}
                        {recentTickets.map((ticket) => (
                            <Link key={ticket.id} href={`/tiket/${ticket.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
                                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', ticket.urgency === 'tinggi' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500')}>
                                    <Wrench className="size-3.5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-800">{ticket.title}</p>
                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                        {ticket.asset?.name ?? ticket.room?.name ?? 'Umum'} · {ticket.code} · {ticket.reporter?.name}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <Badge status={ticket.status} />
                                    <span className="text-[9px] text-slate-400">{formatDateTime(ticket.created_at)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                <Card>
                    <CardHeader
                        title="Peminjaman jatuh tempo"
                        description="Dalam 7 hari ke depan"
                        icon={CalendarClock}
                        action={<Badge color={kpi.overdue_loans ? 'rose' : 'slate'}>{kpi.overdue_loans} terlambat</Badge>}
                    />
                    <div className="divide-y divide-slate-50">
                        {dueLoans.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">Tidak ada peminjaman yang mendekati jatuh tempo.</p>}
                        {dueLoans.map((loan) => (
                            <Link key={loan.id} href="/peminjaman" className="flex items-center gap-2.5 px-5 py-3 transition hover:bg-slate-50">
                                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', loan.is_overdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600')}>
                                    <PackageOpen className="size-3.5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-800">{loan.asset?.name}</p>
                                    <p className="text-[10px] text-slate-500">{loan.borrower?.name}</p>
                                </div>
                                <Badge color={loan.is_overdue ? 'rose' : 'amber'}>
                                    {loan.is_overdue ? `${Math.abs(loan.days_left)} hari lewat` : loan.days_left === 0 ? 'Hari ini' : `${loan.days_left} hari`}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                    <Link href="/peminjaman" className="flex items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[11px] font-semibold text-brand-700 hover:bg-slate-50">
                        Kelola peminjaman <ArrowRight className="size-3" />
                    </Link>
                </Card>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Pemantauan ruangan"
                        description="Jumlah aset dan kondisi tiap ruangan"
                        icon={DoorOpen}
                        action={<Link href="/ruangan" className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">Semua ruangan →</Link>}
                    />
                    <div className="divide-y divide-slate-50">
                        {rooms.map((room) => (
                            <Link key={room.id} href={`/ruangan/${room.id}`} className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                                <span className={cn(
                                    'size-2 shrink-0 rounded-full',
                                    room.status === 'tersedia' && 'bg-emerald-500',
                                    room.status === 'dipakai' && 'bg-blue-500',
                                    room.status === 'dipesan' && 'bg-amber-500',
                                    ['perawatan', 'ditutup'].includes(room.status) && 'bg-slate-400',
                                )} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-800">{room.name}</p>
                                    <p className="text-[10px] text-slate-500">{room.building} · Lantai {room.floor} · {room.type}</p>
                                </div>
                                <div className="hidden text-right sm:block">
                                    <p className="tabular text-xs font-semibold text-slate-700">{formatNumber(room.asset_qty)} unit</p>
                                    <p className="text-[10px] text-slate-400">{room.asset_count} jenis aset</p>
                                </div>
                                {room.damaged > 0 ? (
                                    <Badge color="rose">{room.damaged} rusak</Badge>
                                ) : (
                                    <Badge color="emerald">Baik</Badge>
                                )}
                                <ChevronRightIcon />
                            </Link>
                        ))}
                    </div>
                </Card>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Jadwal hari ini" description="Pemesanan ruangan yang disetujui" icon={CalendarClock} />
                        <div className="divide-y divide-slate-50">
                            {todayBookings.length === 0 && <p className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada jadwal hari ini.</p>}
                            {todayBookings.slice(0, 4).map((booking) => (
                                <div key={booking.id} className="flex gap-3 px-5 py-3">
                                    <div className="w-12 shrink-0 text-center">
                                        <p className="tabular text-[11px] font-bold text-brand-700">{formatTime(booking.starts_at)}</p>
                                        <p className="text-[9px] text-slate-400">{formatTime(booking.ends_at)}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-slate-800">{booking.title}</p>
                                        <p className="text-[10px] text-slate-500">{booking.room?.name} · {booking.user?.name}</p>
                                        <Badge status={booking.status} className="mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/pemesanan" className="flex items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[11px] font-semibold text-brand-700 hover:bg-slate-50">
                            Kalender pemesanan <ArrowRight className="size-3" />
                        </Link>
                    </Card>

                    <Card>
                        <CardHeader title="Stok menipis" description="Persediaan habis pakai" icon={PackageOpen} action={<Badge color="amber">{lowStocks.length}</Badge>} />
                        {lowStocks.length === 0 ? (
                            <p className="px-5 py-8 text-center text-xs text-slate-400">Semua stok dalam kondisi aman.</p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {lowStocks.map((asset) => (
                                    <Link key={asset.id} href={`/aset/${asset.id}`} className="flex items-center gap-2 px-5 py-2.5 transition hover:bg-slate-50">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-slate-800">{asset.name}</p>
                                            <p className="text-[10px] text-slate-400">Minimum {asset.min_stock ?? asset.category?.min_stock ?? 0} unit</p>
                                        </div>
                                        <Badge color="amber">{asset.summary?.tersedia ?? 0} tersisa</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <div className="mt-5">
                <Card>
                    <CardHeader
                        title="Ringkasan perangkat"
                        description="Ketersediaan perangkat elektronik dan perabot"
                        icon={TrendingUp}
                        action={<Link href="/aset?tracking=individual" className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">Detail perangkat →</Link>}
                    />
                    <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        {devices.length === 0 && <p className="text-xs text-slate-400">Belum ada data perangkat.</p>}
                        {devices.map((device) => {
                            const usage = percentage(device.dipakai, device.total);
                            return (
                                <div key={device.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-800">{device.name}</p>
                                        <span className="tabular text-sm font-bold text-slate-900">{device.total}</span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${usage}%` }} />
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                                        <span className="text-emerald-600">{device.tersedia} tersedia</span>
                                        <span className="text-blue-600">{device.dipakai} dipakai</span>
                                        <span className="text-rose-600">{device.rusak} rusak</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

function ChevronRightIcon() {
    return <ArrowUpRight className="size-3.5 shrink-0 text-slate-300" />;
}
