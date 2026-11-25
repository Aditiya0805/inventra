import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BarChart3,
    Bell,
    Boxes,
    CalendarDays,
    Check,
    ChevronDown,
    ClipboardCheck,
    DoorOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    PackageCheck,
    QrCode,
    ScrollText,
    Search,
    Settings,
    ShieldCheck,
    Wrench,
    X,
} from 'lucide-react';
import { cn, initials, timeAgo } from '../lib/utils';

const NAV = [
    {
        group: 'Utama',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Ruangan', href: '/ruangan', icon: DoorOpen },
            { label: 'Pemesanan Ruangan', href: '/pemesanan', icon: CalendarDays },
        ],
    },
    {
        group: 'Inventaris',
        items: [
            { label: 'Data Aset', href: '/aset', icon: Boxes },
            { label: 'Mutasi Aset', href: '/mutasi', icon: ArrowLeftRight },
            { label: 'Stock Opname', href: '/opname', icon: ClipboardCheck, roles: ['super_admin', 'admin_sarpras'] },
        ],
    },
    {
        group: 'Operasional',
        items: [
            { label: 'Peminjaman', href: '/peminjaman', icon: PackageCheck },
            { label: 'Tiket Kerusakan', href: '/tiket', icon: Wrench },
        ],
    },
    {
        group: 'Insight',
        items: [
            { label: 'Laporan', href: '/laporan', icon: BarChart3, roles: ['super_admin', 'admin_sarpras', 'viewer'] },
            { label: 'Log Aktivitas', href: '/log-aktivitas', icon: ScrollText, roles: ['super_admin', 'admin_sarpras'] },
        ],
    },
];

function isActive(url, href) {
    if (href === '/dashboard') return url === '/dashboard' || url === '/';
    if (href === '/aset') return url.startsWith('/aset') && !url.startsWith('/aset/scan');
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
}

function NavItem({ item, active, onNavigate }) {
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition',
                active
                    ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]'
                    : 'text-brand-100/65 hover:bg-white/5 hover:text-white',
            )}
        >
            <item.icon className={cn('size-4.5 shrink-0 transition', active ? 'text-brand-300' : 'text-brand-200/50 group-hover:text-brand-200')} />
            <span className="truncate">{item.label}</span>
            {active && <span className="ml-auto size-1.5 rounded-full bg-brand-300" />}
        </Link>
    );
}

export default function AppLayout({ title, subtitle, children, actions }) {
    const { auth, flash, notifications, settings } = usePage().props;
    const { url } = usePage();
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const notifRef = useRef(null);
    const userRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        if (flash?.success) setToast({ type: 'success', message: flash.success });
        else if (flash?.error) setToast({ type: 'error', message: flash.error });
        else setToast(null);
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        const onClick = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
            if (userRef.current && !userRef.current.contains(event.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
        setNotifOpen(false);
        setUserOpen(false);
    }, [url]);

    const role = user?.role;
    const groups = NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    })).filter((group) => group.items.length);

    const submitSearch = (event) => {
        event.preventDefault();
        const term = new FormData(event.currentTarget).get('q');
        router.get('/aset', term ? { q: term } : {});
        event.currentTarget.reset();
    };

    const openNotifications = () => {
        setNotifOpen((prev) => !prev);
        setUserOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-950 text-white transition-transform duration-300 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-5">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <img src="/images/logo-mambalam.png" alt="MA Muhammadiyah Bandar Lampung" className="size-9 rounded-xl object-contain bg-white p-0.5 shadow-md shadow-brand-950/40" />
                        <div className="leading-tight">
                            <p className="text-[15px] font-bold tracking-tight">Inventra</p>
                            <p className="text-[10px] font-medium tracking-wide text-brand-200/60 truncate max-w-[140px]">MAM Bandar Lampung</p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg p-1.5 text-brand-200/70 hover:bg-white/10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
                    {groups.map((group) => (
                        <div key={group.group} className="mb-6">
                            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-brand-200/35 uppercase">
                                {group.group}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        active={isActive(url, item.href)}
                                        onNavigate={() => setSidebarOpen(false)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {['super_admin', 'admin_sarpras'].includes(role) && (
                        <div className="mb-4">
                            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-brand-200/35 uppercase">Sistem</p>
                            <NavItem
                                item={{ label: 'Pengaturan', href: '/pengaturan', icon: Settings }}
                                active={isActive(url, '/pengaturan')}
                                onNavigate={() => setSidebarOpen(false)}
                            />
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-white/5 p-3">
                    <div className="rounded-xl bg-white/5 p-3">
                        <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-brand-500/20 text-brand-200">
                                <ShieldCheck className="size-3.5" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold text-white">{settings?.school_name}</p>
                                <p className="text-[10px] text-brand-200/50">TA {settings?.academic_year}</p>
                            </div>
                        </div>
                        <p className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2 text-[10px] text-brand-200/40">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Sistem berjalan normal · v1.0
                        </p>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main */}
            <div className="lg:pl-64">
                <header className="no-print sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
                    <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                        <button
                            type="button"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="size-5" />
                        </button>

                        <div className="hidden min-w-0 sm:block">
                            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
                            <p className="truncate text-[11px] text-slate-500">{subtitle ?? settings?.school_name}</p>
                        </div>

                        <form onSubmit={submitSearch} className="ml-auto hidden w-64 md:block">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchRef}
                                    name="q"
                                    placeholder="Cari aset atau kode…"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                                />
                            </div>
                        </form>

                        <Link
                            href="/aset/scan"
                            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 md:ml-0"
                        >
                            <QrCode className="size-4 text-brand-700" />
                            <span className="hidden sm:inline">Scan QR</span>
                        </Link>

                        <div ref={notifRef} className="relative">
                            <button
                                type="button"
                                onClick={openNotifications}
                                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                            >
                                <Bell className="size-4" />
                                {notifications?.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                                        {notifications.unread > 9 ? '9+' : notifications.unread}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
                                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-900">Notifikasi</p>
                                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                            {notifications?.unread ?? 0} belum dibaca
                                        </span>
                                    </div>
                                    <div className="scrollbar-thin max-h-80 overflow-y-auto">
                                        {(notifications?.items ?? []).length === 0 && (
                                            <p className="px-4 py-8 text-center text-xs text-slate-400">Belum ada notifikasi.</p>
                                        )}
                                        {(notifications?.items ?? []).map((notification) => (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => {
                                                    setNotifOpen(false);
                                                    router.post(`/notifikasi/${notification.id}/read`);
                                                }}
                                                className={cn(
                                                    'flex w-full gap-2.5 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50',
                                                    !notification.read_at && 'bg-brand-50/40',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'mt-1 size-1.5 shrink-0 rounded-full',
                                                        notification.read_at ? 'bg-slate-300' : 'bg-brand-500',
                                                    )}
                                                />
                                                <span className="min-w-0">
                                                    <span className="block truncate text-xs font-semibold text-slate-800">
                                                        {notification.title}
                                                    </span>
                                                    <span className="mt-0.5 line-clamp-2 block text-[11px] text-slate-500">
                                                        {notification.message}
                                                    </span>
                                                    <span className="mt-1 block text-[10px] text-slate-400">
                                                        {timeAgo(notification.created_at)}
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <Link
                                        href="/notifikasi"
                                        onClick={() => setNotifOpen(false)}
                                        className="block border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center text-[11px] font-semibold text-brand-700 hover:bg-slate-50"
                                    >
                                        Lihat semua notifikasi
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div ref={userRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setUserOpen((prev) => !prev);
                                    setNotifOpen(false);
                                }}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pr-2 pl-1.5 shadow-sm transition hover:bg-slate-50"
                            >
                                <span className="grid size-7 place-items-center rounded-lg bg-brand-700 text-[10px] font-bold text-white">
                                    {user?.initials ?? initials(user?.name)}
                                </span>
                                <span className="hidden text-left sm:block">
                                    <span className="block max-w-28 truncate text-[11px] font-semibold text-slate-800">
                                        {user?.name}
                                    </span>
                                    <span className="block text-[10px] text-slate-500">{user?.role_label}</span>
                                </span>
                                <ChevronDown className="size-3.5 text-slate-400" />
                            </button>

                            {userOpen && (
                                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
                                        <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
                                        <span className="mt-1.5 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                            {user?.role_label}
                                        </span>
                                    </div>
                                    {['super_admin', 'admin_sarpras'].includes(role) && (
                                        <Link
                                            href="/pengaturan"
                                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            <Settings className="size-3.5" /> Pengaturan
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                    >
                                        <LogOut className="size-3.5" /> Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

                <footer className="no-print mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-8 text-[10px] text-slate-400 sm:px-6 lg:px-8">
                    <p>© {new Date().getFullYear()} Inventra · {settings?.school_name}</p>
                    <p className="flex items-center gap-1">
                        <Check className="size-3 text-emerald-500" /> Data tersinkron dengan inventaris sekolah
                    </p>
                </footer>
            </div>

            {toast && (
                <div className="no-print fixed inset-x-4 bottom-4 z-[60] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
                    <div
                        className={cn(
                            'flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl',
                            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900',
                        )}
                    >
                        <span
                            className={cn(
                                'grid size-6 shrink-0 place-items-center rounded-full',
                                toast.type === 'error' ? 'bg-white/15' : 'bg-emerald-500/20 text-emerald-300',
                            )}
                        >
                            {toast.type === 'error' ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                        </span>
                        <span className="text-xs leading-relaxed">{toast.message}</span>
                        <button type="button" onClick={() => setToast(null)} className="ml-2 rounded p-0.5 text-white/60 hover:text-white">
                            <X className="size-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
