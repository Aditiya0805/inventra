import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, DoorOpen, Save } from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import { Input, Select, Textarea } from '../../Components/Form';
import PageHeader from '../../Components/PageHeader';

export default function RoomForm({ room, buildings, users, types, nextCode }) {
    const isEdit = !!room;
    const { data, setData, post, put, processing, errors } = useForm({
        name: room?.name ?? '',
        code: room?.code ?? nextCode ?? '',
        building_id: room?.building_id ?? buildings[0]?.id ?? '',
        type: room?.type ?? 'kelas',
        floor: room?.floor ?? 1,
        capacity: room?.capacity ?? 32,
        status: room?.status ?? 'tersedia',
        responsible_user_id: room?.responsible_user_id ?? '',
        notes: room?.notes ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        if (isEdit) put(`/ruangan/${room.id}`);
        else post('/ruangan');
    };

    return (
        <AppLayout title={isEdit ? 'Ubah Ruangan' : 'Tambah Ruangan'} subtitle={isEdit ? room.name : 'Ruangan baru'}>
            <Head title={isEdit ? 'Ubah Ruangan' : 'Tambah Ruangan'} />

            <PageHeader
                backHref={isEdit ? `/ruangan/${room.id}` : '/ruangan'}
                title={isEdit ? `Ubah ${room.name}` : 'Tambah Ruangan'}
                description="Lengkapi informasi ruangan agar pemantauan aset dan pemesanan berjalan akurat."
            />

            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-5 xl:col-span-2">
                    <Card>
                        <CardHeader title="Informasi ruangan" description="Identitas dan lokasi ruangan" icon={DoorOpen} />
                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <Input label="Nama ruangan" required value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: Ruang 7A" autoFocus />
                            <Input label="Kode ruangan" required value={data.code} onChange={(e) => setData('code', e.target.value)} error={errors.code} placeholder="Contoh: A101" />
                            <Select label="Gedung" required value={data.building_id} onChange={(e) => setData('building_id', e.target.value)} error={errors.building_id} placeholder="Pilih gedung">
                                {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
                            </Select>
                            <Select label="Jenis ruangan" required value={data.type} onChange={(e) => setData('type', e.target.value)} error={errors.type}>
                                {Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                            </Select>
                            <Input label="Lantai" type="number" min="1" required value={data.floor} onChange={(e) => setData('floor', e.target.value)} error={errors.floor} />
                            <Input label="Kapasitas (orang)" type="number" min="0" required value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} error={errors.capacity} />
                            <Select label="Status dasar" required value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} hint="Status pemakaian otomatis mengikuti jadwal pemesanan.">
                                <option value="tersedia">Tersedia</option>
                                <option value="perawatan">Perawatan</option>
                                <option value="ditutup">Ditutup</option>
                            </Select>
                            <Select label="Penanggung jawab" value={data.responsible_user_id} onChange={(e) => setData('responsible_user_id', e.target.value)} error={errors.responsible_user_id} placeholder="Tidak ditentukan">
                                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </Select>
                            <Textarea label="Catatan" wrapperClass="sm:col-span-2" rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} error={errors.notes} placeholder="Informasi tambahan tentang ruangan…" />
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card className="p-5">
                        <div className="flex items-center gap-2">
                            <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Building2 className="size-4.5" /></span>
                            <div>
                                <p className="text-xs font-semibold text-slate-800">Tips pengisian</p>
                                <p className="text-[10px] text-slate-500">Data yang rapi memudahkan audit</p>
                            </div>
                        </div>
                        <ul className="mt-4 space-y-2.5 text-[11px] leading-relaxed text-slate-500">
                            <li>• Gunakan kode unik sesuai denah sekolah, misalnya <span className="font-semibold text-slate-700">A101</span> untuk Gedung A lantai 1 ruang 01.</li>
                            <li>• Kapasitas menentukan jumlah maksimal orang saat pemesanan ruangan.</li>
                            <li>• Status <span className="font-semibold text-slate-700">Perawatan</span> akan mencegah ruangan dipesan sampai diperbaiki.</li>
                            <li>• Penanggung jawab bertugas memperbarui kondisi aset secara berkala.</li>
                        </ul>
                    </Card>

                    <Card className="p-4">
                        <div className="flex flex-col gap-2">
                            <button type="submit" disabled={processing} className={buttonClass('primary', 'md', 'w-full')}>
                                <Save className="size-4" /> {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Ruangan'}
                            </button>
                            <Link href={isEdit ? `/ruangan/${room.id}` : '/ruangan'} className={buttonClass('secondary', 'md', 'w-full')}>
                                <ArrowLeft className="size-4" /> Batal
                            </Link>
                        </div>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
