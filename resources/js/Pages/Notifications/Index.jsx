import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CheckCheck,
    CheckCircle2,
    Info,
    XCircle,
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button from '../../Components/Button';
import { Card } from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import PageHeader from '../../Components/PageHeader';
import Pagination from '../../Components/Pagination';
import { cn, formatDateTime, timeAgo } from '../../lib/utils';

const TYPE_META = {
    info: { icon: Info, classes: 'bg-blue-50 text-blue-600', label: 'Informasi' },
    success: { icon: CheckCircle2, classes: 'bg-emerald-50 text-emerald-600', label: 'Berhasil' },
    warning: { icon: AlertTriangle, classes: 'bg-amber-50 text-amber-600', label: 'Peringatan' },
    danger: { icon: XCircle, classes: 'bg-rose-50 text-rose-600', label: 'Penting' },
};

export default function NotificationsIndex({ notifications, unread }) {
    const markAll = () => router.post('/notifikasi/read-all', {}, { preserveScroll: true });
    const open = (notification) => router.post(`/notifikasi/${notification.id}/read`);

    return (
        <AppLayout title="Notifikasi" subtitle={`${unread} belum dibaca`}>
            <Head title="Notifikasi" />

            <PageHeader
                title="Notifikasi"
                description="Pemberitahuan terkait peminjaman, kerusakan, mutasi, dan aktivitas sistem."
                badge={unread > 0 ? <Badge color="rose">{unread} baru</Badge> : null}
                actions={
                    <Button variant="secondary" onClick={markAll} disabled={unread === 0}>
                        <CheckCheck className="size-4" /> Tandai semua dibaca
                    </Button>
                }
            />

            <Card className="overflow-hidden">
                {notifications.data.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="Belum ada notifikasi"
                        description="Pemberitahuan baru akan muncul di sini dan pada ikon lonceng di header."
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.data.map((notification) => {
                            const meta = TYPE_META[notification.type] ?? TYPE_META.info;
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => open(notification)}
                                    className={cn(
                                        'flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50/80',
                                        !notification.read_at && 'bg-brand-50/30',
                                    )}
                                >
                                    <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', meta.classes)}>
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800">{notification.title}</span>
                                            {!notification.read_at && <span className="size-1.5 rounded-full bg-brand-500" />}
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                                                {meta.label}
                                            </span>
                                        </span>
                                        <span className="mt-1 block text-xs leading-relaxed text-slate-600">{notification.message}</span>
                                        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                                            <span>{timeAgo(notification.created_at)}</span>
                                            <span>·</span>
                                            <span>{formatDateTime(notification.created_at)}</span>
                                            {notification.url && <span className="font-semibold text-brand-600">Buka detail →</span>}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="border-t border-slate-100 px-5 py-3">
                    <Pagination paginator={notifications} />
                </div>
            </Card>
        </AppLayout>
    );
}
