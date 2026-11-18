import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '../../Components/AuthLayout';

const DEMO_ACCOUNTS = [
    { label: 'Super Admin', email: 'admin@inventra.sch.id', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
    { label: 'Admin Sarpras', email: 'sarpras@inventra.sch.id', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
    { label: 'Guru', email: 'guru@inventra.sch.id', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
    { label: 'Teknisi', email: 'teknisi@inventra.sch.id', tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
];

export default function Login() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'admin@inventra.sch.id',
        password: 'password',
        remember: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    const fillDemo = (email) => {
        setData({ ...data, email, password: 'password' });
    };

    return (
        <AuthLayout title="Selamat datang kembali" description="Masuk untuk memantau aset dan fasilitas sekolah Anda.">
            <Head title="Masuk" />

            {flash?.success && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Email sekolah
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="nama@sekolah.sch.id"
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-3 pl-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{errors.email}</p>}
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                            Kata sandi
                        </label>
                        <Link href="/forgot-password" className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">
                            Lupa kata sandi?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            placeholder="Masukkan kata sandi"
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{errors.password}</p>}
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(event) => setData('remember', event.target.checked)}
                        className="size-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500/30"
                    />
                    Ingat saya di perangkat ini
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
                >
                    {processing ? 'Memproses…' : 'Masuk ke dashboard'}
                    {!processing && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
                </button>
            </form>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">Akun demo — kata sandi: password</p>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    {DEMO_ACCOUNTS.map((account) => (
                        <button
                            key={account.email}
                            type="button"
                            onClick={() => fillDemo(account.email)}
                            className={`rounded-lg px-2.5 py-2 text-left text-[10px] font-semibold ring-1 ring-inset transition hover:brightness-95 ${account.tone}`}
                        >
                            {account.label}
                            <span className="mt-0.5 block truncate text-[9px] font-normal opacity-70">{account.email}</span>
                        </button>
                    ))}
                </div>
            </div>
        </AuthLayout>
    );
}
