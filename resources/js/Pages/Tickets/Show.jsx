import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock,
    DoorOpen,
    Image as ImageIcon,
    MessageSquare,
    Package,
    Trash2,
    User,
    Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import { Input, Select, Textarea } from '../../Components/Form';
import { ConfirmDialog } from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import { formatCurrency, formatDateTime, formatDate } from '../../lib/utils';

export default function TicketShow({ ticket, technicians, statuses, urgencies, timeline }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.is_admin;
    const canUpdate = ['super_admin', 'admin_sarpras', 'teknisi'].includes(user?.role);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const form = useForm({
        status: ticket.status,
        technician_id: ticket.technician_id ?? '',
        urgency: ticket.urgency,
        cost: ticket.cost ?? '',
        repair_notes: ticket.repair_notes ?? '',
    });

    useEffect(() => {
        form.setData({
            status: ticket.status,
            technician_id: ticket.technician_id ?? '',
            urgency: ticket.urgency,
            cost: ticket.cost ?? '',
            repair_notes: ticket.repair_notes ?? '',
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticket.id, ticket.updated_at]);

    const submit = (event) => {
        event.preventDefault();
        form.put(`/tiket/${ticket.id}`, { preserveScroll: true });
    };

    const remove = () => {
        router.delete(`/tiket/${ticket.id}`, {
            onFinish: () => setConfirmDelete(false),
        });
    };

    return (
        <AppLayout title={ticket.title} subtitle={`${ticket.code} · Tiket kerusakan`}>
            <Head title={`${ticket.code} — ${ticket.title}`} />

            <PageHeader
                backHref="/tiket"
                title={ticket.title}
                badge={
                    <>
                        <Badge status={ticket.status} />
                        <Badge status={ticket.urgency} />
                    </>
                }
                description={`${ticket.code} · Dilaporkan ${formatDateTime(ticket.created_at)} oleh ${ticket.reporter?.name ?? '—'}`}
                actions={
                    isAdmin && (
                        <button type="button" onClick={() => setConfirmDelete(true)} className={buttonClass('secondary', 'md', 'text-rose-600 hover:bg-rose-50')}>
                            <Trash2 className="size-4" /> Hapus Tiket
                        </button>
                    )
                }
            />

            <div className="grid gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-5 xl:col-span-2">
                    <Card>
                        <CardHeader title="Detail kerusakan" description="Laporan dari pengguna" icon={Wrench} />
                        <div className="p-5">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{ticket.description}</p>

                            {ticket.photo_url && (
                                <a href={ticket.photo_url} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-xl border border-slate-200">
                                    <img src={ticket.photo_url} alt="Foto kerusakan" className="max-h-80 w-full object-cover" />
                                </a>
                            )}

                            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    { icon: Package, label: 'Aset', value: ticket.asset ? `${ticket.asset.name} (${ticket.asset.code})` : 'Tidak terkait aset' },
                                    { icon: DoorOpen, label: 'Ruangan', value: ticket.room?.name ?? 'Tidak terkait ruangan' },
                                    { icon: AlertTriangle, label: 'Urgensi', value: urgencies[ticket.urgency] ?? ticket.urgency },
                                    { icon: User, label: 'Pelapor', value: ticket.reporter?.name ?? '—' },
                                    { icon: Wrench, label: 'Teknisi', value: ticket.technician?.name ?? 'Belum ditugaskan' },
                                    { icon: CalendarDays, label: 'Diverifikasi', value: ticket.verified_at ? formatDateTime(ticket.verified_at) : 'Belum diverifikasi' },
                                    { icon: CheckCircle2, label: 'Diselesaikan', value: ticket.resolved_at ? formatDateTime(ticket.resolved_at) : 'Belum selesai' },
                                    { icon: ClipboardList, label: 'Biaya perbaikan', value: Number(ticket.cost) > 0 ? formatCurrency(ticket.cost) : 'Belum ada biaya' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-2.5">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                                            <item.icon className="size-3.5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400">{item.label}</p>
                                            <p className="truncate text-xs font-semibold text-slate-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {ticket.repair_notes && (
                                <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
                                    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-brand-700 uppercase">
                                        <MessageSquare className="size-3" /> Catatan perbaikan
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-xs text-slate-700">{ticket.repair_notes}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Riwayat penanganan" description="Alur tiket dari laporan hingga selesai" icon={Clock} />
                        <div className="p-5">
                            <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                                {timeline.map((item, index) => (
                                    <li key={index} className="relative">
                                        <span className="absolute top-0.5 -left-[27px] grid size-3.5 place-items-center rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />
                                        <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                                        <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(item.at)}</p>
                                        {item.note && <p className="mt-1 text-[11px] text-slate-500">{item.note}</p>}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Ringkasan tiket" description="Status dan penanggung jawab" icon={ClipboardList} />
                        <div className="space-y-3 p-5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Status</span>
                                <Badge status={ticket.status} dot>{ticket.status_label}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Urgensi</span>
                                <Badge status={ticket.urgency} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Kode tiket</span>
                                <span className="font-mono text-[11px] font-semibold text-slate-700">{ticket.code}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Tanggal lapor</span>
                                <span className="font-semibold text-slate-700">{formatDate(ticket.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Pelapor</span>
                                <span className="max-w-36 truncate font-semibold text-slate-700">{ticket.reporter?.name ?? '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Teknisi</span>
                                <span className="max-w-36 truncate font-semibold text-slate-700">{ticket.technician?.name ?? 'Belum ditugaskan'}</span>
                            </div>
                        </div>
                    </Card>

                    {canUpdate ? (
                        <Card>
                            <CardHeader title="Perbarui tiket" description="Ubah status, teknisi, dan biaya" icon={Wrench} />
                            <form onSubmit={submit} className="space-y-3 p-5">
                                <Select
                                    label="Status"
                                    required
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                    error={form.errors.status}
                                >
                                    {Object.entries(statuses).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>

                                <Select
                                    label="Teknisi"
                                    value={form.data.technician_id}
                                    onChange={(event) => form.setData('technician_id', event.target.value)}
                                    error={form.errors.technician_id}
                                    placeholder="Belum ditugaskan"
                                >
                                    {technicians.map((technician) => (
                                        <option key={technician.id} value={technician.id}>{technician.name}</option>
                                    ))}
                                </Select>

                                <Select
                                    label="Urgensi"
                                    value={form.data.urgency}
                                    onChange={(event) => form.setData('urgency', event.target.value)}
                                    error={form.errors.urgency}
                                >
                                    {Object.entries(urgencies).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>

                                <Input
                                    label="Biaya perbaikan (Rp)"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={form.data.cost}
                                    onChange={(event) => form.setData('cost', event.target.value)}
                                    error={form.errors.cost}
                                    placeholder="0"
                                />

                                <Textarea
                                    label="Catatan perbaikan"
                                    rows={3}
                                    value={form.data.repair_notes}
                                    onChange={(event) => form.setData('repair_notes', event.target.value)}
                                    error={form.errors.repair_notes}
                                    placeholder="Tindakan yang dilakukan, kendala, atau rekomendasi…"
                                />

                                <Button type="submit" size="sm" loading={form.processing} className="w-full">
                                    Simpan perubahan
                                </Button>

                                {['dilaporkan', 'diverifikasi'].includes(form.data.status) && (
                                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                                        Tips: verifikasi laporan terlebih dahulu, lalu tugaskan teknisi dan ubah status ke “Dalam Perbaikan”.
                                    </p>
                                )}
                            </form>
                        </Card>
                    ) : (
                        <Card className="p-5">
                            <p className="flex items-start gap-2 text-[11px] text-slate-500">
                                <ImageIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                Anda dapat memantau perkembangan tiket ini. Perubahan status dilakukan oleh admin sarana prasarana atau teknisi.
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={remove}
                title="Hapus tiket kerusakan?"
                description={`Tiket ${ticket.code} beserta riwayatnya akan dihapus permanen.`}
                confirmLabel="Ya, hapus tiket"
                danger
            />
        </AppLayout>
    );
}
