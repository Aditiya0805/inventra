import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BellRing,
    Boxes,
    Building2,
    CalendarDays,
    CheckCircle2,
    DoorOpen,
    KeyRound,
    Layers,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Save,
    School,
    Settings as SettingsIcon,
    ShieldCheck,
    Tags,
    Trash2,
    UserCheck,
    UserX,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import Button, { buttonClass } from '../../Components/Button';
import { Card, CardHeader, StatCard } from '../../Components/Card';
import { Checkbox, Input, Select, Textarea, Toggle } from '../../Components/Form';
import Modal, { ConfirmDialog } from '../../Components/Modal';
import PageHeader from '../../Components/PageHeader';
import Tabs from '../../Components/Tabs';
import { ROLE_LABELS, formatDate, formatDateTime, formatNumber } from '../../lib/utils';

const ROLE_COLOR = {
    super_admin: 'violet',
    admin_sarpras: 'blue',
    guru: 'emerald',
    teknisi: 'amber',
    viewer: 'slate',
};

const COLOR_OPTIONS = ['emerald', 'teal', 'blue', 'indigo', 'violet', 'amber', 'orange', 'rose', 'sky', 'slate'];

const EMPTY_USER = {
    name: '',
    email: '',
    role: 'guru',
    phone: '',
    job_title: '',
    password: '',
    password_confirmation: '',
    is_active: true,
};

const EMPTY_BUILDING = { code: '', name: '', floors_count: 1, notes: '' };

const EMPTY_CATEGORY = {
    name: '',
    group: 'furniture',
    tracking_type: 'individual',
    icon: 'box',
    color: 'emerald',
    min_stock: 0,
};

export default function SettingsIndex({ tab, settings, users, buildings, categories, roles, groups, trackingTypes, stats }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.is_super_admin;
    const [activeTab, setActiveTab] = useState(tab || 'sekolah');
    const [confirm, setConfirm] = useState(null);

    const profileForm = useForm({
        school_name: settings.school_name ?? '',
        school_address: settings.school_address ?? '',
        npsn: settings.npsn ?? '',
        headmaster: settings.headmaster ?? '',
        academic_year: settings.academic_year ?? '',
        school_phone: settings.school_phone ?? '',
        school_email: settings.school_email ?? '',
    });

    const alertForm = useForm({
        alert_threshold: settings.alert_threshold ?? 15,
        loan_reminder_days: settings.loan_reminder_days ?? 2,
        email_notifications: Number(settings.email_notifications ?? 1),
    });

    const userForm = useForm({ ...EMPTY_USER });
    const [userModal, setUserModal] = useState({ open: false, user: null });

    const buildingForm = useForm({ ...EMPTY_BUILDING });
    const [buildingModal, setBuildingModal] = useState({ open: false, building: null });

    const categoryForm = useForm({ ...EMPTY_CATEGORY });
    const [categoryModal, setCategoryModal] = useState({ open: false, category: null });

    const saveProfile = (event) => {
        event?.preventDefault();
        profileForm.put('/pengaturan/profil', { preserveScroll: true });
    };

    const saveAlerts = (event) => {
        event?.preventDefault();
        alertForm.put('/pengaturan/peringatan', { preserveScroll: true });
    };

    const openUser = (user = null) => {
        userForm.clearErrors();
        userForm.setData(
            user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone ?? '',
                    job_title: user.job_title ?? '',
                    password: '',
                    password_confirmation: '',
                    is_active: Boolean(user.is_active),
                }
                : { ...EMPTY_USER },
        );
        setUserModal({ open: true, user });
    };

    const saveUser = () => {
        if (userModal.user) {
            userForm.put(`/pengaturan/pengguna/${userModal.user.id}`, {
                preserveScroll: true,
                onSuccess: () => setUserModal({ open: false, user: null }),
            });
        } else {
            userForm.post('/pengaturan/pengguna', {
                preserveScroll: true,
                onSuccess: () => setUserModal({ open: false, user: null }),
            });
        }
    };

    const openBuilding = (building = null) => {
        buildingForm.clearErrors();
        buildingForm.setData(
            building
                ? {
                    code: building.code,
                    name: building.name,
                    floors_count: building.floors_count,
                    notes: building.notes ?? '',
                }
                : { ...EMPTY_BUILDING },
        );
        setBuildingModal({ open: true, building });
    };

    const saveBuilding = () => {
        if (buildingModal.building) {
            buildingForm.put(`/pengaturan/gedung/${buildingModal.building.id}`, {
                preserveScroll: true,
                onSuccess: () => setBuildingModal({ open: false, building: null }),
            });
        } else {
            buildingForm.post('/pengaturan/gedung', {
                preserveScroll: true,
                onSuccess: () => setBuildingModal({ open: false, building: null }),
            });
        }
    };

    const openCategory = (category = null) => {
        categoryForm.clearErrors();
        categoryForm.setData(
            category
                ? {
                    name: category.name,
                    group: category.group,
                    tracking_type: category.tracking_type,
                    icon: category.icon ?? 'box',
                    color: category.color ?? 'emerald',
                    min_stock: category.min_stock ?? 0,
                }
                : { ...EMPTY_CATEGORY },
        );
        setCategoryModal({ open: true, category });
    };

    const saveCategory = () => {
        if (categoryModal.category) {
            categoryForm.put(`/pengaturan/kategori/${categoryModal.category.id}`, {
                preserveScroll: true,
                onSuccess: () => setCategoryModal({ open: false, category: null }),
            });
        } else {
            categoryForm.post('/pengaturan/kategori', {
                preserveScroll: true,
                onSuccess: () => setCategoryModal({ open: false, category: null }),
            });
        }
    };

    const askDelete = ({ title, description, url }) => {
        setConfirm({
            title,
            description,
            run: () => {
                router.delete(url, { preserveScroll: true, onFinish: () => setConfirm(null) });
            },
        });
    };

    const tabs = [
        { key: 'sekolah', label: 'Profil Sekolah', icon: School },
        { key: 'peringatan', label: 'Peringatan', icon: BellRing },
        { key: 'pengguna', label: 'Pengguna', icon: Users, count: stats.users },
        { key: 'gedung', label: 'Gedung', icon: Building2, count: stats.buildings },
        { key: 'kategori', label: 'Kategori Aset', icon: Tags, count: categories.length },
    ];

    return (
        <AppLayout title="Pengaturan" subtitle="Profil sekolah, pengguna, dan data master">
            <Head title="Pengaturan" />

            <PageHeader
                title="Pengaturan Sistem"
                description="Kelola identitas sekolah, ambang peringatan, akun pengguna, gedung, dan kategori aset."
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Pengguna" value={formatNumber(stats.users)} hint={`${formatNumber(stats.active_users)} akun aktif`} icon={Users} tone="brand" />
                <StatCard label="Gedung" value={formatNumber(stats.buildings)} hint="Bangunan terdaftar" icon={Building2} tone="blue" />
                <StatCard label="Ruangan" value={formatNumber(stats.rooms)} hint="Seluruh ruangan" icon={DoorOpen} tone="emerald" />
                <StatCard label="Kategori Aset" value={formatNumber(categories.length)} hint="Klasifikasi inventaris" icon={Tags} tone="violet" />
            </div>

            <div className="mt-5">
                <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            </div>

            {activeTab === 'sekolah' && (
                <div className="mt-4 grid gap-5 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader title="Profil sekolah" description="Informasi ini tampil pada kop laporan dan sidebar" icon={School} />
                        <form onSubmit={saveProfile} className="space-y-3 p-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                    label="Nama sekolah"
                                    required
                                    value={profileForm.data.school_name}
                                    onChange={(event) => profileForm.setData('school_name', event.target.value)}
                                    error={profileForm.errors.school_name}
                                    wrapperClass="sm:col-span-2"
                                />
                                <Textarea
                                    label="Alamat"
                                    required
                                    rows={2}
                                    value={profileForm.data.school_address}
                                    onChange={(event) => profileForm.setData('school_address', event.target.value)}
                                    error={profileForm.errors.school_address}
                                    wrapperClass="sm:col-span-2"
                                />
                                <Input
                                    label="NPSN"
                                    value={profileForm.data.npsn}
                                    onChange={(event) => profileForm.setData('npsn', event.target.value)}
                                    error={profileForm.errors.npsn}
                                />
                                <Input
                                    label="Tahun ajaran"
                                    required
                                    value={profileForm.data.academic_year}
                                    onChange={(event) => profileForm.setData('academic_year', event.target.value)}
                                    error={profileForm.errors.academic_year}
                                    placeholder="2026/2027"
                                />
                                <Input
                                    label="Kepala sekolah"
                                    value={profileForm.data.headmaster}
                                    onChange={(event) => profileForm.setData('headmaster', event.target.value)}
                                    error={profileForm.errors.headmaster}
                                />
                                <Input
                                    label="Telepon sekolah"
                                    value={profileForm.data.school_phone}
                                    onChange={(event) => profileForm.setData('school_phone', event.target.value)}
                                    error={profileForm.errors.school_phone}
                                />
                                <Input
                                    label="Email sekolah"
                                    type="email"
                                    value={profileForm.data.school_email}
                                    onChange={(event) => profileForm.setData('school_email', event.target.value)}
                                    error={profileForm.errors.school_email}
                                    wrapperClass="sm:col-span-2"
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <Button type="submit" size="sm" loading={profileForm.processing}>
                                    <Save className="size-3.5" /> Simpan profil
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Pratinjau identitas" description="Tampilan pada dokumen" icon={SettingsIcon} />
                            <div className="p-5">
                                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-4 text-center">
                                    <img src="/images/logo-mambalam.png" alt="Logo" className="mx-auto size-14 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-sm" />
                                    <p className="mt-2 text-sm font-bold text-slate-900">{profileForm.data.school_name || 'Nama sekolah'}</p>
                                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{profileForm.data.school_address || 'Alamat sekolah'}</p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-slate-200/70 pt-3 text-[10px] text-slate-500">
                                        <span>NPSN {profileForm.data.npsn || '—'}</span>
                                        <span>TA {profileForm.data.academic_year || '—'}</span>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2 text-[11px]">
                                    <p className="flex items-center gap-2 text-slate-500"><School className="size-3.5" /> Kepala sekolah: <span className="font-semibold text-slate-700">{profileForm.data.headmaster || '—'}</span></p>
                                    <p className="flex items-center gap-2 text-slate-500"><Phone className="size-3.5" /> {profileForm.data.school_phone || '—'}</p>
                                    <p className="flex items-center gap-2 text-slate-500"><Mail className="size-3.5" /> {profileForm.data.school_email || '—'}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-5">
                            <p className="flex items-start gap-2 text-[11px] text-slate-500">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                Profil sekolah digunakan pada kop laporan PDF, label QR, dan footer aplikasi.
                            </p>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'peringatan' && (
                <div className="mt-4 grid gap-5 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader title="Ambang peringatan & notifikasi" description="Atur kapan sistem mengingatkan pengelola" icon={BellRing} />
                        <form onSubmit={saveAlerts} className="space-y-4 p-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                    label="Ambang stok menipis"
                                    type="number"
                                    min="1"
                                    max="100"
                                    required
                                    value={alertForm.data.alert_threshold}
                                    onChange={(event) => alertForm.setData('alert_threshold', event.target.value)}
                                    error={alertForm.errors.alert_threshold}
                                    hint="Persentase atau jumlah minimum sebelum peringatan muncul."
                                />
                                <Input
                                    label="Pengingat sebelum jatuh tempo"
                                    type="number"
                                    min="0"
                                    max="30"
                                    required
                                    value={alertForm.data.loan_reminder_days}
                                    onChange={(event) => alertForm.setData('loan_reminder_days', event.target.value)}
                                    error={alertForm.errors.loan_reminder_days}
                                    hint="Jumlah hari sebelum peminjaman berakhir."
                                />
                            </div>

                            <div className="rounded-xl border border-slate-200 px-4 py-3">
                                <Toggle
                                    checked={Boolean(Number(alertForm.data.email_notifications))}
                                    onChange={(value) => alertForm.setData('email_notifications', value ? 1 : 0)}
                                    label="Notifikasi email"
                                    description="Kirim ringkasan peringatan penting ke email pengelola sarana prasarana."
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" size="sm" loading={alertForm.processing}>
                                    <Save className="size-3.5" /> Simpan pengaturan
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card>
                        <CardHeader title="Efek pengaturan" description="Bagaimana sistem merespons" icon={AlertTriangle} />
                        <div className="space-y-3 p-5 text-[11px] text-slate-600">
                            <div className="rounded-lg bg-amber-50 px-3 py-2.5">
                                <p className="font-semibold text-amber-800">Stok menipis</p>
                                <p className="mt-0.5 text-amber-700">
                                    Aset habis pakai dengan jumlah tersedia di bawah ambang akan ditandai pada dashboard dan data aset.
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 px-3 py-2.5">
                                <p className="font-semibold text-blue-800">Pengingat peminjaman</p>
                                <p className="mt-0.5 text-blue-700">
                                    Peminjaman yang mendekati jatuh tempo akan muncul pada ringkasan dashboard.
                                </p>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                                <p className="font-semibold text-slate-700">Notifikasi email</p>
                                <p className="mt-0.5 text-slate-500">
                                    Saat ini notifikasi dalam aplikasi selalu aktif. Pengaturan email disiapkan untuk integrasi pengiriman surel.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'pengguna' && (
                <Card className="mt-4 overflow-hidden">
                    <CardHeader
                        title="Manajemen pengguna"
                        description={`${stats.active_users} dari ${stats.users} akun aktif`}
                        icon={Users}
                        action={
                            isSuperAdmin && (
                                <Button size="sm" onClick={() => openUser()}>
                                    <Plus className="size-3.5" /> Tambah Pengguna
                                </Button>
                            )
                        }
                    />
                    {!isSuperAdmin && (
                        <p className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-[10px] text-slate-500">
                            Hanya Super Admin yang dapat menambah, mengubah, atau menonaktifkan pengguna.
                        </p>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Pengguna</th>
                                    <th className="px-3 py-3 font-semibold">Peran</th>
                                    <th className="px-3 py-3 font-semibold">Jabatan / kontak</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                    <th className="px-3 py-3 font-semibold">Terakhir masuk</th>
                                    {isSuperAdmin && <th className="px-5 py-3 text-right font-semibold">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="grid size-8 place-items-center rounded-lg bg-brand-700 text-[10px] font-bold text-white">
                                                    {(user.name ?? '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-800">{user.name}</p>
                                                    <p className="truncate text-[10px] text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <Badge color={ROLE_COLOR[user.role] ?? 'slate'}>{roles[user.role] ?? user.role}</Badge>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-slate-600">{user.job_title || '—'}</p>
                                            <p className="text-[10px] text-slate-400">{user.phone || '—'}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <Badge status={user.is_active ? 'aktif' : 'nonaktif'} dot />
                                        </td>
                                        <td className="px-3 py-3 text-slate-500">
                                            {user.last_login_at ? formatDateTime(user.last_login_at) : 'Belum pernah'}
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <button type="button" onClick={() => openUser(user)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" title="Ubah pengguna">
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/pengaturan/pengguna/${user.id}/toggle`, {}, { preserveScroll: true })}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-amber-600"
                                                        title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        {user.is_active ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => askDelete({
                                                            title: 'Hapus pengguna?',
                                                            description: `${user.name} (${user.email}) akan dihapus permanen. Riwayat aktivitas tetap tersimpan tanpa pengguna.`,
                                                            url: `/pengaturan/pengguna/${user.id}`,
                                                        })}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                        title="Hapus pengguna"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'gedung' && (
                <Card className="mt-4 overflow-hidden">
                    <CardHeader
                        title="Data gedung"
                        description={`${buildings.length} gedung terdaftar`}
                        icon={Building2}
                        action={<Button size="sm" onClick={() => openBuilding()}><Plus className="size-3.5" /> Tambah Gedung</Button>}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Gedung</th>
                                    <th className="px-3 py-3 text-center font-semibold">Lantai</th>
                                    <th className="px-3 py-3 text-center font-semibold">Ruangan</th>
                                    <th className="px-3 py-3 font-semibold">Catatan</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {buildings.map((building) => (
                                    <tr key={building.id} className="transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-800">{building.name}</p>
                                            <p className="font-mono text-[10px] text-slate-400">{building.code}</p>
                                        </td>
                                        <td className="tabular px-3 py-3 text-center text-slate-600">{formatNumber(building.floors_count)}</td>
                                        <td className="tabular px-3 py-3 text-center">
                                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                                {formatNumber(building.rooms_count)} ruangan
                                            </span>
                                        </td>
                                        <td className="max-w-56 px-3 py-3">
                                            <p className="truncate text-[11px] text-slate-500">{building.notes || '—'}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-0.5">
                                                <button type="button" onClick={() => openBuilding(building)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" title="Ubah gedung">
                                                    <Pencil className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => askDelete({
                                                        title: 'Hapus gedung?',
                                                        description: `${building.name} akan dihapus. Gedung yang masih memiliki ruangan tidak dapat dihapus.`,
                                                        url: `/pengaturan/gedung/${building.id}`,
                                                    })}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                    title="Hapus gedung"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'kategori' && (
                <Card className="mt-4 overflow-hidden">
                    <CardHeader
                        title="Kategori aset"
                        description={`${categories.length} kategori terdaftar`}
                        icon={Tags}
                        action={<Button size="sm" onClick={() => openCategory()}><Plus className="size-3.5" /> Tambah Kategori</Button>}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kategori</th>
                                    <th className="px-3 py-3 font-semibold">Kelompok</th>
                                    <th className="px-3 py-3 font-semibold">Pencatatan</th>
                                    <th className="px-3 py-3 text-center font-semibold">Stok minimum</th>
                                    <th className="px-3 py-3 text-center font-semibold">Aset</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.map((category) => (
                                    <tr key={category.id} className="transition hover:bg-slate-50/70">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-800">{category.name}</p>
                                            <p className="font-mono text-[10px] text-slate-400">{category.slug}</p>
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">{groups[category.group] ?? category.group}</td>
                                        <td className="px-3 py-3">
                                            <Badge color={category.tracking_type === 'bulk' ? 'amber' : 'blue'}>
                                                {trackingTypes[category.tracking_type] ?? category.tracking_type}
                                            </Badge>
                                        </td>
                                        <td className="tabular px-3 py-3 text-center text-slate-600">{formatNumber(category.min_stock)}</td>
                                        <td className="tabular px-3 py-3 text-center font-semibold text-slate-700">{formatNumber(category.assets_count)}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-0.5">
                                                <button type="button" onClick={() => openCategory(category)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" title="Ubah kategori">
                                                    <Pencil className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => askDelete({
                                                        title: 'Hapus kategori?',
                                                        description: `${category.name} akan dihapus. Kategori yang masih digunakan aset tidak dapat dihapus.`,
                                                        url: `/pengaturan/kategori/${category.id}`,
                                                    })}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                    title="Hapus kategori"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Modal pengguna */}
            <Modal
                open={userModal.open}
                onClose={() => setUserModal({ open: false, user: null })}
                title={userModal.user ? 'Ubah pengguna' : 'Tambah pengguna'}
                description={userModal.user ? `Perbarui data akun ${userModal.user.name}.` : 'Buat akun baru dan tentukan perannya.'}
                icon={Users}
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setUserModal({ open: false, user: null })}>Batal</Button>
                        <Button size="sm" onClick={saveUser} loading={userForm.processing}>
                            {userModal.user ? 'Simpan perubahan' : 'Tambah pengguna'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={(event) => { event.preventDefault(); saveUser(); }} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Nama lengkap" required value={userForm.data.name} onChange={(event) => userForm.setData('name', event.target.value)} error={userForm.errors.name} />
                        <Input label="Email" type="email" required value={userForm.data.email} onChange={(event) => userForm.setData('email', event.target.value)} error={userForm.errors.email} />
                        <Select label="Peran" required value={userForm.data.role} onChange={(event) => userForm.setData('role', event.target.value)} error={userForm.errors.role}>
                            {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </Select>
                        <Input label="Jabatan" value={userForm.data.job_title} onChange={(event) => userForm.setData('job_title', event.target.value)} error={userForm.errors.job_title} placeholder="Contoh: Wakil Kepala Sekolah" />
                        <Input label="Nomor telepon" value={userForm.data.phone} onChange={(event) => userForm.setData('phone', event.target.value)} error={userForm.errors.phone} />
                        <div className="flex items-end pb-2">
                            <Checkbox
                                id="user-active"
                                label="Akun aktif"
                                description="Pengguna dapat masuk ke aplikasi."
                                checked={Boolean(userForm.data.is_active)}
                                onChange={(event) => userForm.setData('is_active', event.target.checked)}
                            />
                        </div>
                        <Input
                            label={userModal.user ? 'Kata sandi baru' : 'Kata sandi'}
                            type="password"
                            required={!userModal.user}
                            value={userForm.data.password}
                            onChange={(event) => userForm.setData('password', event.target.value)}
                            error={userForm.errors.password}
                            hint={userModal.user ? 'Biarkan kosong jika tidak diubah. Minimal 8 karakter.' : 'Minimal 8 karakter.'}
                        />
                        <Input
                            label="Konfirmasi kata sandi"
                            type="password"
                            required={!userModal.user}
                            value={userForm.data.password_confirmation}
                            onChange={(event) => userForm.setData('password_confirmation', event.target.value)}
                            error={userForm.errors.password_confirmation}
                        />
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">Hak akses peran: </span>
                        Super Admin (semua fitur), Admin Sarpras (aset, ruangan, laporan, pengaturan), Guru/Staf (pemesanan, peminjaman, laporan kerusakan), Teknisi (tiket & peminjaman), Viewer (hanya melihat).
                    </div>
                </form>
            </Modal>

            {/* Modal gedung */}
            <Modal
                open={buildingModal.open}
                onClose={() => setBuildingModal({ open: false, building: null })}
                title={buildingModal.building ? 'Ubah gedung' : 'Tambah gedung'}
                description="Gedung menjadi induk dari ruangan-ruangan sekolah."
                icon={Building2}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setBuildingModal({ open: false, building: null })}>Batal</Button>
                        <Button size="sm" onClick={saveBuilding} loading={buildingForm.processing}>
                            {buildingModal.building ? 'Simpan perubahan' : 'Tambah gedung'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={(event) => { event.preventDefault(); saveBuilding(); }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Kode gedung" required value={buildingForm.data.code} onChange={(event) => buildingForm.setData('code', event.target.value)} error={buildingForm.errors.code} placeholder="GD-A" />
                        <Input label="Jumlah lantai" type="number" min="1" max="20" required value={buildingForm.data.floors_count} onChange={(event) => buildingForm.setData('floors_count', event.target.value)} error={buildingForm.errors.floors_count} />
                    </div>
                    <Input label="Nama gedung" required value={buildingForm.data.name} onChange={(event) => buildingForm.setData('name', event.target.value)} error={buildingForm.errors.name} placeholder="Gedung A" />
                    <Textarea label="Catatan" rows={2} value={buildingForm.data.notes} onChange={(event) => buildingForm.setData('notes', event.target.value)} error={buildingForm.errors.notes} />
                </form>
            </Modal>

            {/* Modal kategori */}
            <Modal
                open={categoryModal.open}
                onClose={() => setCategoryModal({ open: false, category: null })}
                title={categoryModal.category ? 'Ubah kategori' : 'Tambah kategori'}
                description="Tentukan cara pencatatan aset pada kategori ini."
                icon={Tags}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setCategoryModal({ open: false, category: null })}>Batal</Button>
                        <Button size="sm" onClick={saveCategory} loading={categoryForm.processing}>
                            {categoryModal.category ? 'Simpan perubahan' : 'Tambah kategori'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={(event) => { event.preventDefault(); saveCategory(); }} className="space-y-3">
                    <Input label="Nama kategori" required value={categoryForm.data.name} onChange={(event) => categoryForm.setData('name', event.target.value)} error={categoryForm.errors.name} placeholder="Contoh: Proyektor" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Select label="Kelompok" required value={categoryForm.data.group} onChange={(event) => categoryForm.setData('group', event.target.value)} error={categoryForm.errors.group}>
                            {Object.entries(groups).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </Select>
                        <Select label="Jenis pencatatan" required value={categoryForm.data.tracking_type} onChange={(event) => categoryForm.setData('tracking_type', event.target.value)} error={categoryForm.errors.tracking_type}>
                            {Object.entries(trackingTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </Select>
                        <Input label="Stok minimum" type="number" min="0" value={categoryForm.data.min_stock} onChange={(event) => categoryForm.setData('min_stock', event.target.value)} error={categoryForm.errors.min_stock} hint="Untuk kategori massal / habis pakai." />
                        <Select label="Warna label" value={categoryForm.data.color} onChange={(event) => categoryForm.setData('color', event.target.value)} error={categoryForm.errors.color}>
                            {COLOR_OPTIONS.map((color) => <option key={color} value={color}>{color}</option>)}
                        </Select>
                    </div>
                    <Input label="Ikon" value={categoryForm.data.icon} onChange={(event) => categoryForm.setData('icon', event.target.value)} error={categoryForm.errors.icon} hint="Nama ikon internal (opsional)." />
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                        Kategori <span className="font-semibold">massal</span> mendukung jumlah stok, sedangkan <span className="font-semibold">per unit</span> mencatat setiap aset secara individual dengan kode unik.
                    </p>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(confirm)}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm?.run?.()}
                title={confirm?.title}
                description={confirm?.description}
                confirmLabel="Ya, hapus"
                danger
            />
        </AppLayout>
    );
}
