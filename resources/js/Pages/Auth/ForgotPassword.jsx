import { Head, Link, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import AuthLayout from '../../Components/AuthLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <AuthLayout
            title="Reset kata sandi"
            description="Masukkan email akun sekolah Anda. Kami akan mengirim tautan untuk membuat kata sandi baru."
        >
            <Head title="Lupa Kata Sandi" />
            {status && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700 ring-1 ring-emerald-200">{status}</div>}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email sekolah</label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="nama@sekolah.sch.id"
                            className="w-full rounded-xl border border-slate-300 py-3 pr-3 pl-10 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{errors.email}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
                >
                    {processing ? 'Mengirim…' : 'Kirim tautan reset'}
                </button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-500">
                Ingat kata sandi Anda?{' '}
                <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Kembali masuk</Link>
            </p>
        </AuthLayout>
    );
}
