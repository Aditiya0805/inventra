import { Head, Link, useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import AuthLayout from '../../Components/AuthLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/reset-password');
    };

    return (
        <AuthLayout title="Buat kata sandi baru" description="Gunakan minimal 8 karakter agar akun Anda tetap aman.">
            <Head title="Reset Kata Sandi" />
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email sekolah</label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            className="w-full rounded-xl border border-slate-300 py-3 pr-3 pl-10 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{errors.email}</p>}
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kata sandi baru</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                    />
                    {errors.password && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{errors.password}</p>}
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Ulangi kata sandi</label>
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
                >
                    {processing ? 'Menyimpan…' : 'Simpan kata sandi'}
                </button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-500">
                <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Kembali ke halaman masuk</Link>
            </p>
        </AuthLayout>
    );
}
