import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUp,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Compass,
    DoorClosed,
    ExternalLink,
    GraduationCap,
    HeartHandshake,
    HelpCircle,
    Info,
    Laptop,
    Layers,
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
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { buttonClass } from '../Components/Button';
import { formatNumber } from '../lib/utils';

export default function Home({ school, buildings = [], stats = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeBuildingTab, setActiveBuildingTab] = useState(buildings[0]?.code ?? 'A');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [selectedRoomModal, setSelectedRoomModal] = useState(null);

    const selectedBuilding = buildings.find((b) => b.code === activeBuildingTab) ?? buildings[0];

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const programs = [
        {
            title: 'Tahfidz Al-Qur’an & ISMUBA',
            desc: 'Target hafalan minimal 3 Juz dengan pembiasaan ibadah harian serta penguatan nilai Al-Islam dan Kemuhammadiyahan.',
            icon: BookOpen,
            badge: 'Program Utama',
            tone: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white',
        },
        {
            title: 'Pembelajaran Sains & Digital',
            desc: 'Laboratorium komputer dan IPA untuk penguasaan teknologi informasi dan praktikum ilmiah yang aplikatif.',
            icon: Laptop,
            badge: 'Teknologi',
            tone: 'bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white',
        },
        {
            title: 'Kemandirian & Karakter Unggul',
            desc: 'Pengembangan kepemimpinan siswa melalui IPM, Kepanduan Hizbul Wathan (HW), dan Tapak Suci Putra Muhammadiyah.',
            icon: Compass,
            badge: 'Kepanduan & Bela Diri',
            tone: 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
        },
        {
            title: 'Kesiapan Studi Lanjut',
            desc: 'Bimbingan intensif persiapan masuk Perguruan Tinggi Negeri (PTN) maupun Perguruan Tinggi Keagamaan Islam Negeri (PTKIN).',
            icon: GraduationCap,
            badge: 'Akademik',
            tone: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white',
        },
    ];

    const missions = [
        'Mampu mengamalkan nilai-nilai ajaran agama Islam secara benar dan konsekuen.',
        'Mampu membaca Al-Qur’an dengan baik dan benar (tartil).',
        'Lulusan ditargetkan menghafal minimal 3 Juz Al-Qur’an.',
        'Unggul dan berprestasi dalam berbagai ajang perlombaan akademis maupun non-akademis.',
        'Mampu melanjutkan pendidikan ke jenjang yang lebih tinggi (Perguruan Tinggi).',
    ];

    const faqs = [
        {
            q: 'Bagaimana cara mendaftar peserta didik baru (PPDB)?',
            a: 'Pendaftaran dapat dilakukan secara online melalui website resmi madrasah di www.mambalam.sch.id atau langsung mengunjungi sekretariat panitia PPDB di Kampus MA Muhammadiyah Sukarame, Bandar Lampung.',
        },
        {
            q: 'Apa saja ekstrakurikuler dan organisasi yang tersedia?',
            a: 'Madrasah memiliki organisasi otonom Muhammadiyah resmi, antara lain Ikatan Pelajar Muhammadiyah (IPM), Kepanduan Hizbul Wathan (HW), dan Seni Bela Diri Tapak Suci Putra Muhammadiyah, serta berbagai klub akademik, seni islami, dan olahraga.',
        },
        {
            q: 'Bagaimana sistem monitoring sarana prasarana (Inventra) bekerja?',
            a: 'Seluruh aset, peralatan laboratorium, kursi kelas, dan ruangan memiliki label QR Code unik yang terdata di sistem. Staf, guru, maupun teknisi dapat memindai QR code untuk mengecek riwayat, peminjaman, serta status pemeliharaan secara real-time.',
        },
        {
            q: 'Apakah fasilitas laboratorium dan kelas sudah memadai?',
            a: 'MA Muhammadiyah Bandar Lampung memiliki 14 ruangan aktif yang mencakup ruang kelas X, XI, XII, Lab Komputer, Lab IPA, Perpustakaan, Aula Serbaguna, Mushola, dan fasilitas penunjang lainnya dengan tingkat kesiapan mencapai 100%.',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-brand-600 selection:text-white relative">
            <Head title={`Beranda · ${school.name}`} />

            {/* Liquid Glass Navbar */}
            <div className="fixed top-0 inset-x-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 transition-all duration-300">
                <header className="relative mx-auto max-w-7xl rounded-2xl sm:rounded-full border border-white/70 bg-white/65 backdrop-blur-2xl saturate-150 shadow-[0_8px_32px_0_rgba(15,23,42,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.95)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-full before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent">
                    <div className="flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Logo & Brand */}
                        <a href="#hero" className="flex items-center gap-3 group">
                            <div className="relative">
                                <img
                                    src="/images/logo-mambalam.png"
                                    alt={school.name}
                                    className="size-10 sm:size-11 rounded-xl object-contain bg-white/95 p-1 shadow-xs border border-white/90 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                            </div>
                            <div className="leading-tight">
                                <span className="block text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-brand-800 transition">
                                    {school.name}
                                </span>
                                <span className="block text-[10px] sm:text-[11px] font-medium text-slate-500">
                                    Sistem Informasi &amp; Sarana Prasarana
                                </span>
                            </div>
                        </a>

                        {/* Desktop Navigation with Liquid Glass Pills */}
                        <nav className="hidden items-center gap-1 text-[13px] font-medium text-slate-600 lg:flex rounded-full bg-slate-900/[0.04] p-1 border border-white/60 backdrop-blur-md">
                            <a href="#profil" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">Profil</a>
                            <a href="#visi-misi" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">Visi &amp; Misi</a>
                            <a href="#program" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">Program</a>
                            <a href="#fasilitas" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">Fasilitas</a>
                            <a href="#faq" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">FAQ</a>
                            <a href="#kontak" className="rounded-full px-3.5 py-1.5 transition-all duration-200 hover:bg-white hover:text-brand-800 hover:shadow-xs active:scale-95">Kontak</a>
                        </nav>

                        {/* Header Actions */}
                        <div className="hidden items-center gap-2.5 sm:flex">
                            <Link
                                href="/aset/scan"
                                className="group relative inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur transition-all duration-300 hover:bg-white hover:text-brand-700 hover:shadow-sm hover:scale-105 active:scale-95 overflow-hidden"
                            >
                                <span className="absolute inset-0 w-1/2 h-full bg-white/40 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700" />
                                <QrCode className="size-3.5 text-brand-600 transition-transform duration-300 group-hover:rotate-12" />
                                <span>Scan QR Aset</span>
                            </Link>

                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-900/20 transition-all duration-300 hover:bg-brand-800 hover:scale-105 active:scale-95"
                                >
                                    <Building2 className="size-3.5" />
                                    <span>Dashboard ({user.name.split(' ')[0]})</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-900/20 transition-all duration-300 hover:bg-brand-800 hover:scale-105 active:scale-95"
                                >
                                    <LogIn className="size-3.5" />
                                    <span>Masuk Sistem</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-xl p-2 text-slate-600 hover:bg-white/80 lg:hidden border border-transparent hover:border-white/60 transition active:scale-95"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>

                    {/* Mobile Dropdown with Liquid Glass */}
                    {mobileMenuOpen && (
                        <div className="border-t border-white/60 bg-white/85 px-4 py-4 backdrop-blur-2xl rounded-b-2xl sm:rounded-b-3xl lg:hidden shadow-xl animate-scale-in">
                            <div className="space-y-1 text-sm font-medium text-slate-700">
                                <a
                                    href="#profil"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Profil Madrasah
                                </a>
                                <a
                                    href="#visi-misi"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Visi &amp; Misi
                                </a>
                                <a
                                    href="#program"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Program Unggulan
                                </a>
                                <a
                                    href="#fasilitas"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Fasilitas &amp; Sarpras
                                </a>
                                <a
                                    href="#faq"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Tanya Jawab (FAQ)
                                </a>
                                <a
                                    href="#kontak"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-xl px-3 py-2 hover:bg-white/90 hover:text-brand-800 transition"
                                >
                                    Kontak &amp; Lokasi
                                </a>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-200/60">
                                <Link
                                    href="/aset/scan"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white bg-white/90 py-2.5 text-xs font-semibold text-slate-800 shadow-xs active:scale-95 transition"
                                >
                                    <QrCode className="size-4 text-brand-600" /> Scan QR Aset
                                </Link>
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-95 transition"
                                    >
                                        Dashboard ({user.name})
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-95 transition"
                                    >
                                        <LogIn className="size-4" /> Masuk Sistem
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </header>
            </div>

            {/* Hero Section */}
            <section id="hero" className="relative overflow-hidden bg-brand-950 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-32 text-white">
                {/* Dynamic animated background effects */}
                <div className="absolute inset-0 bg-grid opacity-25" />
                <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-brand-500/20 blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-32 size-[500px] rounded-full bg-emerald-400/15 blur-3xl animate-float-reverse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-teal-600/10 blur-[120px] pointer-events-none" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                <span>Portal Resmi &amp; Monitoring Sarpras Real-Time</span>
                            </div>

                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.15]">
                                Madrasah Aliyah Muhammadiyah <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-300">Bandar Lampung</span>
                            </h1>

                            <p className="mt-4 text-base leading-relaxed text-brand-100/80 sm:text-lg">
                                Menempa generasi berakhlak mulia dengan visi <strong>Islami, Unggul, dan Mandiri</strong>. Dilengkapi sistem pemantauan sarana prasarana sekolah terintegrasi berbasis QR Code modern.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <a
                                    href="#fasilitas"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/50 transition-all duration-300 hover:bg-brand-500 hover:shadow-brand-500/25 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <Layers className="size-4" />
                                    <span>Jelajahi Fasilitas</span>
                                </a>

                                <Link
                                    href="/aset/scan"
                                    className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <QrCode className="size-4 text-brand-300 transition-transform group-hover:scale-125" />
                                    <span>Scan QR Aset &amp; Kursi</span>
                                </Link>

                                <a
                                    href={school.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group inline-flex items-center gap-1.5 rounded-xl px-4 py-3.5 text-sm font-medium text-brand-200 transition-all hover:text-white hover:bg-white/5 active:scale-95"
                                >
                                    <span>Website Utama</span>
                                    <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                                <div className="group rounded-xl p-2 transition hover:bg-white/5">
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">Akreditasi</p>
                                    <p className="mt-1 text-xl font-bold">Peringkat {school.accreditation}</p>
                                </div>
                                <div className="group rounded-xl p-2 transition hover:bg-white/5">
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">NPSN / NSM</p>
                                    <p className="mt-1 text-sm font-bold font-mono">{school.npsn} / {school.nsm}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1 group rounded-xl p-2 transition hover:bg-white/5">
                                    <p className="text-[11px] font-medium tracking-wide text-brand-300 uppercase">Tahun Ajaran</p>
                                    <p className="mt-1 text-xl font-bold">{school.academic_year}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Interactive Card */}
                        <div className="lg:col-span-5 animate-scale-in">
                            <div className="group relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:shadow-brand-500/10 hover:-translate-y-1 sm:p-8">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                    <div className="relative">
                                        <img
                                            src="/images/logo-mambalam.png"
                                            alt="Logo MA Muhammadiyah"
                                            className="size-16 rounded-2xl object-contain bg-white p-1.5 shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                                        />
                                        <span className="absolute -top-1 -right-1 flex size-3">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wider text-brand-300 uppercase">Identitas Lembaga</p>
                                        <h2 className="text-lg font-bold text-white leading-snug">{school.name}</h2>
                                        <p className="text-xs text-brand-200/70">{school.foundation}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3.5 text-xs text-brand-100/90">
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/5 transition hover:bg-white/10">
                                        <User className="size-4 shrink-0 text-brand-300 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-brand-200/60">Kepala Madrasah</p>
                                            <p className="font-semibold text-white text-sm">{school.headmaster}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/5 transition hover:bg-white/10">
                                        <MapPin className="size-4 shrink-0 text-brand-300 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-brand-200/60">Lokasi Kampus</p>
                                            <p className="leading-relaxed text-white">{school.address}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="rounded-2xl bg-emerald-500/20 p-3.5 border border-emerald-500/30 transition duration-300 hover:scale-105">
                                            <p className="text-[10px] uppercase font-bold text-emerald-300">Sarpras Terpantau</p>
                                            <p className="text-2xl font-black text-white mt-1">{stats.ready_percentage}%</p>
                                            <p className="text-[10px] text-emerald-200 mt-0.5 flex items-center gap-1">
                                                <CheckCircle2 className="size-3 text-emerald-400" /> Siap digunakan
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-brand-500/20 p-3.5 border border-brand-500/30 transition duration-300 hover:scale-105">
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

            {/* Quick Metrics Bar with interactive hover */}
            <section className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-6 shadow-xl sm:grid-cols-4">
                    <div className="group rounded-2xl p-3 border-r border-slate-100 last:border-0 transition-all duration-300 hover:bg-slate-50 hover:scale-105">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gedung Madrasah</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 group-hover:text-brand-700 transition sm:text-3xl">{stats.buildings_count} Gedung</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kampus terpadu Sukarame</p>
                    </div>
                    <div className="group rounded-2xl p-3 border-r border-slate-100 last:border-0 transition-all duration-300 hover:bg-slate-50 hover:scale-105">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruang &amp; Fasilitas</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 group-hover:text-brand-700 transition sm:text-3xl">{stats.rooms_count} Ruangan</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kelas X, XI, XII &amp; Lab</p>
                    </div>
                    <div className="group rounded-2xl p-3 border-r border-slate-100 last:border-0 transition-all duration-300 hover:bg-slate-50 hover:scale-105">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset &amp; Inventaris</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 group-hover:text-brand-700 transition sm:text-3xl">{formatNumber(stats.total_assets)}+ Unit</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Terdata dengan kode QR</p>
                    </div>
                    <div className="group rounded-2xl p-3 transition-all duration-300 hover:bg-slate-50 hover:scale-105">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kesiapan Belajar</p>
                        <p className="mt-1 text-2xl font-black text-emerald-600 group-hover:text-emerald-700 transition sm:text-3xl">{stats.ready_percentage}%</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Fasilitas aktif normal</p>
                    </div>
                </div>
            </section>

            {/* Profil & Visi Misi Section */}
            <section id="profil" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                            <Sparkles className="size-3" /> Tentang Madrasah
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Mendidik dengan Hati, Mencetak Prestasi
                        </h2>
                        <p className="mt-3 text-base text-slate-600 leading-relaxed">
                            MA Muhammadiyah Bandar Lampung adalah jenjang pendidikan menengah atas berciri khas Islam yang berkomitmen mencetak kader persyarikatan dan generasi bangsa yang berakhlak mulia serta berwawasan masa depan.
                        </p>
                    </div>

                    {/* Visi & Misi Grid */}
                    <div id="visi-misi" className="mt-16 grid gap-8 lg:grid-cols-12 items-stretch">
                        {/* Visi Card */}
                        <div className="group relative rounded-3xl border border-brand-200/80 bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 p-8 sm:p-10 text-white shadow-xl lg:col-span-5 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-brand-500/20 blur-2xl group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur-xs">
                                    <Award className="size-4 text-brand-300" />
                                    <span>Visi Resmi Madrasah</span>
                                </div>
                                <h3 className="mt-8 text-3xl font-extrabold sm:text-4xl tracking-tight leading-snug">
                                    &ldquo;Islami, Unggul, dan Mandiri&rdquo;
                                </h3>
                                <p className="mt-5 text-sm leading-relaxed text-brand-100/75">
                                    Visi ini menjadi pedoman utama seluruh aktivitas pembelajaran, pembinaan santri/siswa, serta pengelolaan sarana prasarana penunjang kegiatan belajar mengajar di lingkungan madrasah.
                                </p>
                            </div>

                            <div className="relative mt-10 rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-xs">
                                <p className="text-xs font-semibold text-brand-300">Penyelenggara</p>
                                <p className="text-sm font-bold text-white mt-0.5">{school.foundation}</p>
                                <p className="text-[11px] text-brand-200/60 mt-1">Komplek Perguruan Muhammadiyah Sukarame</p>
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm lg:col-span-7 flex flex-col justify-between transition-all duration-500 hover:shadow-lg">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700">
                                    <CheckCircle2 className="size-4 text-brand-600" />
                                    <span>Misi Madrasah</span>
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                                    5 Langkah Nyata Pembinaan Siswa
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Misi strategis dalam membentuk karakter dan kualitas lulusan:
                                </p>

                                <div className="mt-6 space-y-3">
                                    {missions.map((misi, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-start gap-3.5 rounded-2xl p-3 border border-transparent transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/40 hover:translate-x-1"
                                        >
                                            <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900 font-medium">
                                                {misi}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                                <span>Kurikulum: Nasional (Kemenag &amp; Kemendikbud) + ISMUBA</span>
                                <span className="font-semibold text-brand-700">Akreditasi {school.accreditation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Unggulan Section */}
            <section id="program" className="bg-slate-100/70 py-24 sm:py-32 border-y border-slate-200/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                            Kurikulum &amp; Pembinaan
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
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
                                className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-brand-200 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className={`grid size-12 place-items-center rounded-2xl border transition-all duration-300 ${prog.tone}`}>
                                            <prog.icon className="size-6 transition-transform duration-300 group-hover:scale-110" />
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">
                                            {prog.badge}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-brand-700 transition">
                                        {prog.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                        {prog.desc}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-[11px] font-semibold text-brand-700 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Program aktif</span>
                                    <CheckCircle2 className="size-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fasilitas & Sarana Prasarana (Live from DB) */}
            <section id="fasilitas" className="py-24 sm:py-32">
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
                                Terhubung langsung dengan sistem monitoring aset Inventra. Klik salah satu ruangan untuk melihat detail fasilitas secara interaktif.
                            </p>
                        </div>

                        {/* Building Switcher Tabs */}
                        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                            {buildings.map((b) => (
                                <button
                                    key={b.code}
                                    type="button"
                                    onClick={() => setActiveBuildingTab(b.code)}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                                        activeBuildingTab === b.code
                                            ? 'bg-brand-700 text-white shadow-md scale-102'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    {b.name.split('—')[0].trim()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Building Details */}
                    {selectedBuilding && (
                        <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 animate-scale-in">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                                        Kode Gedung: {selectedBuilding.code}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-900">{selectedBuilding.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{selectedBuilding.notes || 'Ruang pembelajaran aktif'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        {selectedBuilding.floors_count} Lantai
                                    </span>
                                    <span className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                                        {selectedBuilding.rooms?.length ?? 0} Ruangan
                                    </span>
                                </div>
                            </div>

                            {/* Rooms Grid */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedBuilding.rooms?.map((room) => (
                                    <button
                                        type="button"
                                        key={room.id}
                                        onClick={() => setSelectedRoomModal(room)}
                                        className="group text-left rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all duration-300 hover:border-brand-300 hover:bg-white hover:shadow-md hover:-translate-y-1 active:scale-98"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="grid size-9 place-items-center rounded-xl bg-brand-100/70 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                                                    <DoorClosed className="size-4.5" />
                                                </span>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-800 transition">{room.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-mono">Kode: {room.code}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 capitalize border border-emerald-100">
                                                {room.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
                                            <span>Lantai {room.floor}</span>
                                            <span>Kapasitas: <strong className="text-slate-700">{room.capacity} orang</strong></span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QR Code Feature Banner */}
                    <div className="mt-12 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 size-60 rounded-full bg-brand-500/20 blur-3xl" />
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex items-start gap-5">
                                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-200 border border-white/15 shadow-inner backdrop-blur animate-float">
                                    <QrCode className="size-8" />
                                </span>
                                <div>
                                    <h4 className="text-xl font-bold">Pemeriksaan Cepat dengan QR Code Fasilitas</h4>
                                    <p className="mt-2 text-xs text-brand-100/80 max-w-xl leading-relaxed">
                                        Seluruh kursi, meja, dan peralatan di MA Muhammadiyah Bandar Lampung dilengkapi label QR Code unik. Siswa dan guru dapat memindai langsung menggunakan kamera HP untuk melihat riwayat perawatan atau melaporkan kerusakan sarana.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/aset/scan"
                                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-brand-900 shadow-xl transition-all duration-300 hover:bg-slate-100 hover:scale-105 active:scale-95 shrink-0"
                            >
                                <QrCode className="size-4 text-brand-700 transition-transform group-hover:rotate-12" />
                                <span>Buka Scanner QR</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Section */}
            <section id="faq" className="bg-slate-100/70 py-24 sm:py-32 border-t border-slate-200/60">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                            Informasi Tambahan
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Tanya Jawab Seputar Madrasah (FAQ)
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Pertanyaan umum mengenai proses pendaftaran, kegiatan siswa, dan sarana prasarana.
                        </p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = activeFaq === index;
                            return (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 shadow-xs hover:border-brand-200"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setActiveFaq(isOpen ? null : index)}
                                        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                                    >
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="size-4.5 text-brand-600 shrink-0" />
                                            <span>{faq.q}</span>
                                        </span>
                                        <ChevronDown
                                            className={`size-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                                                isOpen ? 'rotate-180 text-brand-600' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="border-t border-slate-100 px-5 pt-3 pb-5 text-xs text-slate-600 leading-relaxed bg-slate-50/50 animate-fade-in-up">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Kontak & Lokasi Section */}
            <section id="kontak" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-12 items-start">
                        {/* Contact Information */}
                        <div className="lg:col-span-6 space-y-6">
                            <div>
                                <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
                                    Hubungi Kami
                                </span>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Pusat Informasi &amp; Layanan
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                    Untuk informasi PPDB, kunjungan lembaga, legalisir ijazah, maupun konsultasi sarana prasarana, silakan menghubungi kantor madrasah.
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-slate-700">
                                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:translate-x-1">
                                    <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                                        <MapPin className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Alamat Kampus</p>
                                        <p className="mt-0.5 font-medium leading-relaxed">{school.address}</p>
                                    </div>
                                </div>

                                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:translate-x-1">
                                    <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                                        <Phone className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Telepon / WhatsApp</p>
                                        <p className="mt-0.5 font-semibold text-slate-900">{school.phone}</p>
                                    </div>
                                </div>

                                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:translate-x-1">
                                    <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                                        <Mail className="size-5" />
                                    </div>
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
                                    Kunjungi media sosial dan situs resmi untuk pembaruan kegiatan madrasah:
                                </p>

                                <div className="mt-6 space-y-3">
                                    <a
                                        href={school.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-300 hover:border-brand-300 hover:bg-brand-50/30 hover:scale-101"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 font-bold text-xs group-hover:bg-brand-700 group-hover:text-white transition">
                                                WEB
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Website Utama Madrasah</p>
                                                <p className="text-xs text-slate-500 font-mono">www.mambalam.sch.id</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                                    </a>

                                    <a
                                        href={school.socials?.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-300 hover:border-pink-300 hover:bg-pink-50/30 hover:scale-101"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-pink-50 text-pink-600 font-bold text-xs group-hover:bg-pink-600 group-hover:text-white transition">
                                                IG
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Instagram Resmi</p>
                                                <p className="text-xs text-slate-500">@ma_muhammadiyah_sukarame</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition" />
                                    </a>

                                    <a
                                        href={school.socials?.youtube}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-300 hover:border-red-300 hover:bg-red-50/30 hover:scale-101"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 font-bold text-xs group-hover:bg-red-600 group-hover:text-white transition">
                                                YT
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">YouTube Channel</p>
                                                <p className="text-xs text-slate-500">@mamsabalam</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="size-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition" />
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

            {/* Room Detail Modal (Interactive Click) */}
            {selectedRoomModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up"
                    onClick={() => setSelectedRoomModal(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                                    <DoorClosed className="size-6" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{selectedRoomModal.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono">Kode Ruangan: {selectedRoomModal.code}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRoomModal(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3 text-xs text-slate-600">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Status Operasional</span>
                                <span className="font-semibold text-emerald-600 capitalize">{selectedRoomModal.status}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Posisi Lantai</span>
                                <span className="font-semibold text-slate-800">Lantai {selectedRoomModal.floor}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Kapasitas Belajar</span>
                                <span className="font-semibold text-slate-800">{selectedRoomModal.capacity} Siswa/Guru</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Link
                                href="/aset/scan"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-xs font-semibold text-white hover:bg-brand-800 transition"
                            >
                                <QrCode className="size-4" /> Scan QR Ruangan Ini
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSelectedRoomModal(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Back to Top Button (Liquid Glass) */}
            {showBackToTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full border border-white/80 bg-white/75 text-brand-800 shadow-[0_8px_32px_0_rgba(15,23,42,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition-all duration-300 hover:bg-white hover:scale-115 active:scale-95 animate-fade-in-up"
                    aria-label="Kembali ke atas"
                >
                    <ArrowUp className="size-5" />
                </button>
            )}

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
                            <Link href="/aset/scan" className="hover:text-brand-700 transition">Scan QR</Link>
                            <span>·</span>
                            <Link href="/login" className="hover:text-brand-700 transition">Masuk Sistem</Link>
                            <span>·</span>
                            <a href={school.website} target="_blank" rel="noreferrer" className="hover:text-brand-700 transition">mambalam.sch.id</a>
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
