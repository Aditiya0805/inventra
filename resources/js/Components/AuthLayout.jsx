import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({ children, title, description }) {
    const { settings } = usePage().props;

    return (
        <div className="flex min-h-screen bg-white">
            <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-brand-950 p-10 text-white lg:flex xl:p-14">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute -top-32 -right-24 size-96 rounded-full bg-brand-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="relative">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <img src="/images/logo-mambalam.png" alt="MA Muhammadiyah Bandar Lampung" className="size-11 rounded-2xl object-contain bg-white p-1 shadow-lg shadow-brand-950/50" />
                        <div>
                            <p className="text-lg font-bold tracking-tight">Inventra</p>
                            <p className="text-[11px] font-medium tracking-wide text-brand-200/60">MA Muhammadiyah Bandar Lampung</p>
                        </div>
                    </Link>

                    <div className="mt-20 max-w-lg">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-brand-100">
                            <Sparkles className="size-3.5 text-brand-300" />
                            Satu tempat untuk seluruh aset sekolah
                        </span>
                        <h1 className="mt-5 text-4xl leading-[1.15] font-bold tracking-tight xl:text-[2.75rem]">
                            Lihat, kelola, dan rawat aset sekolah dalam satu dashboard.
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed text-brand-100/65">
                            Pantau kondisi ruangan, kursi, dan perangkat secara real-time. Laporkan kerusakan, kelola peminjaman, dan siapkan laporan inventaris tanpa pencatatan manual.
                        </p>

                        <div className="mt-10 grid grid-cols-3 gap-4">
                            {[
                                ['14', 'Ruangan terpantau'],
                                ['600+', 'Unit kursi'],
                                ['100%', 'Riwayat tercatat'],
                            ].map(([value, label]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                                    <p className="text-xl font-bold">{value}</p>
                                    <p className="mt-0.5 text-[10px] leading-snug text-brand-100/50">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 text-[11px] text-brand-100/40">
                    <ShieldCheck className="size-4" />
                    Data aman, akses berbasis peran, dan seluruh perubahan tercatat.
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between px-6 py-5 lg:px-10">
                    <Link href="/" className="flex items-center gap-2.5 lg:hidden">
                        <img src="/images/logo-mambalam.png" alt="MA Muhammadiyah Bandar Lampung" className="size-9 rounded-xl object-contain bg-white p-0.5 border border-slate-200" />
                        <span className="text-base font-bold text-slate-900">Inventra</span>
                    </Link>
                    <Link
                        href="/"
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800"
                    >
                        <ArrowLeft className="size-3.5" /> Kembali ke beranda
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
                            <p className="mt-1.5 text-sm text-slate-500">{description}</p>
                        </div>
                        {children}
                        <p className="mt-10 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            {settings?.school_name} · Tahun Ajaran {settings?.academic_year}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
