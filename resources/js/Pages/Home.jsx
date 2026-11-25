import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Compass,
    DoorClosed,
    ExternalLink,
    GraduationCap,
    HeartHandshake,
    Laptop,
    LogIn,
    Mail,
    MapPin,
    Menu,
    Phone,
    QrCode,
    School,
    ShieldCheck,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { buttonClass } from '../Components/Button';
import { formatNumber } from '../lib/utils';

export default function Home({ school, buildings = [], stats = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeBuildingTab, setActiveBuildingTab] = useState(buildings[0]?.code ?? 'A');

    const selectedBuilding = buildings.find((b) => b.code === activeBuildingTab) ?? buildings[0];

    const programs = [
        {
            title: 'Tahfidz Al-Qur’an & ISMUBA',
            desc: 'Target hafalan minimal 3 Juz dengan pembiasaan ibadah harian serta penguatan nilai Al-Islam dan Kemuhammadiyahan.',
            icon: BookOpen,
            tone: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        },
        {
            title: 'Pembelajaran Sains & Digital',
            desc: 'Laboratorium komputer dan IPA untuk penguasaan teknologi informasi dan praktikum ilmiah yang aplikatif.',
            icon: Laptop,
            tone: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        },
        {
            title: 'Kemandirian & Karakter Unggul',
            desc: 'Pengembangan kepemimpinan siswa melalui IPM, Kepanduan Hizbul Wathan (HW), dan Tapak Suci Putra Muhammadiyah.',
            icon: Compass,
            tone: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        },
        {
            title: 'Kesiapan Studi Lanjut',
            desc: 'Bimbingan intensif persiapan masuk Perguruan Tinggi Negeri (PTN) maupun Perguruan Tinggi Keagamaan Islam Negeri (PTKIN).',
            icon: GraduationCap,
            tone: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        },
    ];

    const missions = [
        'Mampu mengamalkan nilai-nilai ajaran agama Islam secara benar dan konsekuen.',
        'Mampu membaca Al-Qur’an dengan baik dan benar (tartil).',
        'Lulusan ditargetkan menghafal minimal 3 Juz Al-Qur’an.',
        'Unggul dan berprestasi dalam berbagai ajang perlombaan akademis maupun non-akademis.',
        'Mampu melanjutkan pendidikan ke jenjang yang lebih tinggi (Perguruan Tinggi).',
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-brand-600 selection:text-white">
            <Head title={`Beranda · ${school.name}`} />

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3.5">
                        <img
                            src="/images/logo-mambalam.png"
                            alt={school.name}
                            className="size-12 rounded-xl object-contain bg-white p-1 shadow-sm border border-slate-200"
                        />
                        <div className="leading-tight">
                            <span className="block text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                                {school.name}
                            </span>
                            <span className="block text-[11px] font-medium text-slate-500">
                                Sistem Informasi &amp; Sarana Prasarana
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 lg:flex">
                        <a href="#profil" className="transition hover:text-brand-700">Profil</a>
                        <a href="#visi-misi" className="transition hover:text-brand-700">Visi &amp; Misi</a>
                        <a href="#program" className="transition hover:text-brand-700">Program</a>
                        <a href="#fasilitas" className="transition hover:text-brand-700">Fasilitas &amp; Sarpras</a>
                        <a href="#kontak" className="transition hover:text-brand-700">Kontak</a>
                    </nav>

                    {/* Header Actions */}
                    <div className="hidden items-center gap-2.5 sm:flex">
                        <Link
                            href="/aset/scan"
                            className={buttonClass('secondary', 'sm', 'gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100')}
                        >
                            <QrCode className="size-3.5 text-brand-600" />
                            <span>Scan QR Aset</span>
                        </Link>

                        {user ? (
                            <Link href="/dashboard" className={buttonClass('primary', 'sm', 'gap-1.5')}>
                                <Building2 className="size-3.5" />
                                <span>Dashboard ({user.name.split(' ')[0]})</span>
                            </Link>
                        ) : (
                            <Link href="/login" className={buttonClass('primary', 'sm', 'gap-1.5')}>
                                <LogIn className="size-3.5" />
                                <span>Masuk Sistem</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {mobileMenuOpen && (
                    <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 lg:hidden">
                        <div className="space-y-2 py-2 text-sm font-medium text-slate-700">
                            <a
                                href="#profil"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                Profil Madrasah
                            </a>
                            <a
                                href="#visi-misi"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                Visi &amp; Misi
                            </a>
                            <a
                                href="#program"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                Program Unggulan
                            </a>
                            <a
                                href="#fasilitas"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                Fasilitas &amp; Sarpras
                            </a>
                            <a
                                href="#kontak"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                            >
                                Kontak &amp; Lokasi
                            </a>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-slate-100">
                            <Link
                                href="/aset/scan"
                                className={buttonClass('secondary', 'md', 'w-full justify-center')}
                            >
                                <QrCode className="size-4 text-brand-600" /> Scan QR Aset
                            </Link>
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className={buttonClass('primary', 'md', 'w-full justify-center')}
                                >
                                    Dashboard ({user.name})
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className={buttonClass('primary', 'md', 'w-full justify-center')}
                                >
                                    <LogIn className="size-4" /> Masuk Sistem
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section id="hero" className="relative overflow-hidden bg-brand-950 py-16 text-white sm:py-24 lg:py-28">
                {/* Background effects */}
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-brand-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-32 size-[500px] rounded-full bg-emerald-400/15 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        {/* Hero Text */}
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200">
                                <Sparkles className="size-3.5 text-brand-300" />
                                <span>Mitra Pendidikan · Portal Informasi &amp; Sarana Prasarana</span>
                            </div>

                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.15]">
                                Madrasah Aliyah Muhammadiyah <span className="text-brand-300">Bandar Lampung</span>
                            </h1>

                            <p className="mt-4 text-base leading-relaxed text-brand-100/80 sm:text-lg">
                                Membentuk generasi yang <strong>Islami, Unggul, dan Mandiri</strong> melalui kurikulum terpadu, tahfidz Al-Qur’an, serta sarana prasarana belajar yang terpantau secara transparan dan berstandar.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <a
                                    href="#fasilitas"
                                    className={buttonClass('primary', 'lg', 'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-900/50')}
                                >
                                    Jelajahi Fasilitas
                                </a>
                                <Link
                                    href="/aset/scan"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    <QrCode className="size-4 text-brand-300" />
                                    Scan QR Aset &amp; Kursi
                                </Link>
                                <a
                                    href={school.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-brand-200 transition hover:text-white"
                                >
                                    <span>Website Utama</span>
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                                <div>
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">Akreditasi</p>
                                    <p className="mt-1 text-xl font-bold">Peringkat {school.accreditation}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">NPSN / NSM</p>
                                    <p className="mt-1 text-sm font-bold font-mono">{school.npsn} / {school.nsm}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">Tahun Ajaran</p>
                                    <p className="mt-1 text-xl font-bold">{school.academic_year}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Card */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                    <img
                                        src="/images/logo-mambalam.png"
                                        alt="Logo MA Muhammadiyah"
                                        className="size-16 rounded-2xl object-contain bg-white p-1.5 shadow-md"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold tracking-wider text-brand-300 uppercase">Profil Singkat</p>
                                        <h2 className="text-lg font-bold text-white leading-snug">{school.name}</h2>
                                        <p className="text-xs text-brand-200/70">{school.foundation}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4 text-xs text-brand-100/90">
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/5">
                                        <User className="size-4 shrink-0 text-brand-300 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-brand-200/60">Kepala Madrasah</p>
                                            <p className="font-semibold text-white text-sm">{school.headmaster}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/5">
                                        <MapPin className="size-4 shrink-0 text-brand-300 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-brand-200/60">Lokasi Kampus</p>
                                            <p className="leading-relaxed text-white">{school.address}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="rounded-2xl bg-emerald-500/20 p-3.5 border border-emerald-500/30">
                                            <p className="text-[10px] uppercase font-bold text-emerald-300">Sarpras Terpantau</p>
                                            <p className="text-2xl font-black text-white mt-1">{stats.ready_percentage}%</p>
                                            <p className="text-[10px] text-emerald-200 mt-0.5">Kondisi siap pakai</p>
                                        </div>
                                        <div className="rounded-2xl bg-brand-500/20 p-3.5 border border-brand-500/30">
                                            <p className="text-[10px] uppercase font-bold text-brand-300">Ruangan Aktif</p>
                                            <p className="text-2xl font-black text-white mt-1">{stats.rooms_count}</p>
                                            <p className="text-[10px] text-brand-200 mt-0.5">Kelas, lab &amp; aula</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Metrics Bar */}
            <section className="relative z-10 -mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg sm:grid-cols-4 sm:p-6">
                    <div className="border-r border-slate-100 last:border-0 pr-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gedung Madrasah</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{stats.buildings_count} Gedung</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kampus terpadu Sukarame</p>
                    </div>
                    <div className="border-r border-slate-100 last:border-0 pr-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ruang &amp; Fasilitas</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{stats.rooms_count} Ruangan</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kelas X, XI, XII &amp; Lab</p>
                    </div>
                    <div className="border-r border-slate-100 last:border-0 pr-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aset &amp; Inventaris</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{formatNumber(stats.total_assets)}+ Unit</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Terdata dengan kode QR</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kesiapan Belajar</p>
                        <p className="mt-1 text-2xl font-black text-emerald-600 sm:text-3xl">{stats.ready_percentage}%</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Fasilitas aktif normal</p>
                    </div>
                </div>
            </section>

            {/* Profil & Visi Misi Section */}
            <section id="profil" className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                            Tentang Madrasah
                        </span>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Mendidik dengan Hati, Mencetak Prestasi
                        </h2>
                        <p className="mt-3 text-base text-slate-600">
                            MA Muhammadiyah Bandar Lampung adalah jenjang pendidikan menengah atas berciri khas Islam yang berkomitmen mencetak kader persyarikatan dan generasi bangsa yang berakhlak mulia serta berwawasan masa depan.
                        </p>
                    </div>

                    {/* Visi & Misi Grid */}
                    <div id="visi-misi" className="mt-16 grid gap-8 lg:grid-cols-12 items-stretch">
                        {/* Visi Card */}
                        <div className="rounded-3xl border border-brand-200/80 bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 p-8 text-white shadow-xl lg:col-span-5 flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-200">
                                    <Award className="size-4 text-brand-300" />
                                    <span>Visi Resmi Madrasah</span>
                                </div>
                                <h3 className="mt-8 text-2xl font-extrabold sm:text-3xl tracking-tight leading-snug">
                                    &ldquo;Islami, Unggul, dan Mandiri&rdquo;
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-brand-100/75">
                                    Visi ini menjadi kompas utama seluruh aktivitas pembelajaran, pembinaan santri/siswa, serta pengembangan sarana prasarana penunjang kegiatan belajar mengajar di lingkungan madrasah.
                                </p>
                            </div>

                            <div className="mt-8 rounded-2xl bg-white/5 p-4 border border-white/10">
                                <p className="text-xs font-semibold text-brand-300">Penyelenggara</p>
                                <p className="text-sm font-bold text-white mt-0.5">{school.foundation}</p>
                                <p className="text-[11px] text-brand-200/60 mt-1">Komplek Perguruan Muhammadiyah Sukarame</p>
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm lg:col-span-7 flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                    <CheckCircle2 className="size-4 text-brand-600" />
                                    <span>Misi Madrasah</span>
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                                    Langkah Nyata Pembinaan Siswa
                                </h3>
                                <p className="mt-2 text-xs text-slate-500">
                                    Misi strategis dalam membentuk karakter dan kualitas lulusan:
                                </p>

                                <div className="mt-6 space-y-3.5">
                                    {missions.map((misi, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm text-slate-700 leading-relaxed">{misi}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                                <span>Kurikulum: Nasional (Kemenag &amp; Kemendikbud) + ISMUBA</span>
                                <span className="font-semibold text-brand-700">Akreditasi {school.accreditation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Unggulan Section */}
            <section id="program" className="bg-slate-100/70 py-20 sm:py-28 border-y border-slate-200/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                            Kurikulum &amp; Pembinaan
                        </span>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Program Unggulan Madrasah
                        </h2>
                        <p className="mt-3 text-sm text-slate-600">
                            Mengintegrasikan ilmu pengetahuan, keterampilan teknologi, dan pendalaman keagamaan Islam secara berimbang.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {programs.map((prog, index) => (
                            <div
                                key={index}
                                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className={`grid size-12 place-items-center rounded-2xl border ${prog.tone}`}>
                                    <prog.icon className="size-6" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-brand-700 transition">
                                    {prog.title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    {prog.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fasilitas & Sarana Prasarana (Live from DB) */}
            <section id="fasilitas" className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                                Sarana &amp; Prasarana
                            </span>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Gedung &amp; Ruangan Pembelajaran
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-slate-600">
                                Data terintegrasi secara real-time dengan sistem pemantauan aset Inventra. Setiap ruangan dilengkapi fasilitas standar pembelajaran.
                            </p>
                        </div>

                        {/* Building Switcher Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {buildings.map((b) => (
                                <button
                                    key={b.code}
                                    type="button"
                                    onClick={() => setActiveBuildingTab(b.code)}
                                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                        activeBuildingTab === b.code
                                            ? 'bg-brand-700 text-white shadow-md'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {b.name.split('—')[0].trim()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Building Details */}
                    {selectedBuilding && (
                        <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                                        Kode Gedung: {selectedBuilding.code}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-900">{selectedBuilding.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{selectedBuilding.notes || 'Ruang pembelajaran aktif'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        {selectedBuilding.floors_count} Lantai
                                    </span>
                                    <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                                        {selectedBuilding.rooms?.length ?? 0} Ruangan
                                    </span>
                                </div>
                            </div>

                            {/* Rooms Grid */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedBuilding.rooms?.map((room) => (
                                    <div
                                        key={room.id}
                                        className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:border-brand-200 hover:bg-white hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className="grid size-8 place-items-center rounded-lg bg-brand-100/60 text-brand-700">
                                                    <DoorClosed className="size-4" />
                                                </span>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{room.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-mono">Kode: {room.code}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 capitalize">
                                                {room.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
                                            <span>Lantai {room.floor}</span>
                                            <span>Kapasitas: <strong className="text-slate-700">{room.capacity} orang</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QR Code Feature Banner */}
                    <div className="mt-12 rounded-3xl bg-gradient-to-r from-brand-900 to-brand-800 p-8 text-white shadow-xl">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-200 border border-white/10">
                                    <QrCode className="size-7" />
                                </span>
                                <div>
                                    <h4 className="text-lg font-bold">Pemeriksaan Cepat dengan QR Code Fasilitas</h4>
                                    <p className="mt-1 text-xs text-brand-100/80 max-w-xl leading-relaxed">
                                        Seluruh kursi, meja, dan perangkat di MA Muhammadiyah Bandar Lampung dilengkapi label stiker QR Code unik. Siswa dan guru dapat memindai untuk melihat status serta melaporkan kerusakan secara instan.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/aset/scan"
                                className={buttonClass('primary', 'lg', 'bg-white text-brand-900 hover:bg-slate-100 shrink-0 font-bold')}
                            >
                                Buka Scanner QR
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kontak & Lokasi Section */}
            <section id="kontak" className="bg-slate-100/80 py-20 sm:py-28 border-t border-slate-200/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-12 items-start">
                        {/* Contact Information */}
                        <div className="lg:col-span-6 space-y-6">
                            <div>
                                <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                                    Hubungi Kami
                                </span>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Pusat Informasi Madrasah
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                    Untuk informasi pendaftaran santri/siswa baru, kunjungan, kerjasama, maupun pelayanan administrasi sekolah, silakan hubungi kontak resmi kami.
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-slate-700">
                                <div className="flex items-start gap-3.5 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
                                    <MapPin className="size-5 shrink-0 text-brand-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Alamat Kampus</p>
                                        <p className="mt-0.5 font-medium leading-relaxed">{school.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
                                    <Phone className="size-5 shrink-0 text-brand-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Telepon / WhatsApp</p>
                                        <p className="mt-0.5 font-semibold text-slate-900">{school.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
                                    <Mail className="size-5 shrink-0 text-brand-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Email Resmi</p>
                                        <p className="mt-0.5 font-semibold text-slate-900">{school.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Media Sosial Card */}
                        <div className="lg:col-span-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900">Kanal Informasi Resmi</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Kunjungi media sosial dan situs utama untuk pembaruan kegiatan madrasah:
                                </p>

                                <div className="mt-6 space-y-3">
                                    <a
                                        href={school.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 font-bold text-xs">
                                                WEB
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Website Utama Madrasah</p>
                                                <p className="text-xs text-slate-500 font-mono">www.mambalam.sch.id</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400" />
                                    </a>

                                    <a
                                        href={school.socials?.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-pink-300 hover:bg-pink-50/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-pink-50 text-pink-600 font-bold text-xs">
                                                IG
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Instagram Resmi</p>
                                                <p className="text-xs text-slate-500">@ma_muhammadiyah_sukarame</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400" />
                                    </a>

                                    <a
                                        href={school.socials?.youtube}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-red-300 hover:bg-red-50/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 font-bold text-xs">
                                                YT
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">YouTube Channel</p>
                                                <p className="text-xs text-slate-500">@mamsabalam</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400" />
                                    </a>
                                </div>

                                <div className="mt-8 rounded-2xl bg-brand-50/60 p-4 border border-brand-100 flex items-center gap-3 text-xs text-brand-900">
                                    <ShieldCheck className="size-5 shrink-0 text-brand-700" />
                                    <span>
                                        Sistem terkelola di bawah naungan <strong>{school.foundation}</strong>.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/logo-mambalam.png"
                                alt="Logo"
                                className="size-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200"
                            />
                            <div>
                                <p className="font-bold text-slate-900">{school.name}</p>
                                <p className="text-[11px] text-slate-400">Tahun Ajaran {school.academic_year} · NPSN {school.npsn}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-500">
                            <Link href="/aset/scan" className="hover:text-brand-700">Scan QR</Link>
                            <span>·</span>
                            <Link href="/login" className="hover:text-brand-700">Masuk Sistem</Link>
                            <span>·</span>
                            <a href={school.website} target="_blank" rel="noreferrer" className="hover:text-brand-700">mambalam.sch.id</a>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center text-[11px] text-slate-400">
                        &copy; {new Date().getFullYear()} {school.name} &amp; Inventra. Seluruh hak cipta dilindungi undang-undang.
                    </div>
                </div>
            </footer>
        </div>
    );
}
