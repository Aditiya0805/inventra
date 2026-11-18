import { Head, Link, router } from '@inertiajs/react';
import { Camera, CameraOff, CheckCircle2, QrCode, Search, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import Badge from '../../Components/Badge';
import { buttonClass } from '../../Components/Button';
import { Card, CardHeader } from '../../Components/Card';
import PageHeader from '../../Components/PageHeader';
import { cn } from '../../lib/utils';

export default function AssetScan({ recent }) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [manual, setManual] = useState('');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastCode, setLastCode] = useState(null);
    const scannerRef = useRef(null);

    const lookup = async (code, redirect = false) => {
        if (!code) return;
        setLoading(true);
        setError(null);
        setLastCode(code);
        try {
            const response = await fetch(`/aset/lookup?code=${encodeURIComponent(code)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const payload = await response.json();
            setMatches(payload.matches ?? []);
            if (redirect && payload.matches?.length === 1) {
                router.visit(payload.matches[0].url);
            }
        } catch {
            setError('Tidak dapat menghubungi server. Periksa koneksi Anda.');
        } finally {
            setLoading(false);
        }
    };

    const startScan = async () => {
        setError(null);
        setMatches([]);
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decoded) => {
                    scanner.stop().catch(() => {});
                    scannerRef.current = null;
                    setScanning(false);
                    lookup(decoded, true);
                },
                () => {},
            );
            setScanning(true);
        } catch (err) {
            setScanning(false);
            setError('Kamera tidak dapat diakses. Berikan izin kamera atau gunakan pencarian manual di bawah.');
        }
    };

    const stopScan = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch {}
            scannerRef.current = null;
        }
        setScanning(false);
    };

    useEffect(() => () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
        }
    }, []);

    const submitManual = (event) => {
        event.preventDefault();
        lookup(manual);
    };

    return (
        <AppLayout title="Scan QR Aset" subtitle="Pemindaian label aset">
            <Head title="Scan QR Aset" />

            <PageHeader
                backHref="/aset"
                title="Scan QR Aset"
                description="Pindai label QR pada aset untuk membuka detail dan melakukan aksi cepat."
            />

            <div className="grid gap-5 xl:grid-cols-3">
                <div className="min-w-0 space-y-5 xl:col-span-2">
                    <Card className="overflow-hidden">
                        <CardHeader
                            title="Kamera pemindai"
                            description="Arahkan kamera ke label QR aset"
                            icon={Camera}
                            action={scanning ? (
                                <button type="button" onClick={stopScan} className={buttonClass('danger', 'sm')}>
                                    <CameraOff className="size-3.5" /> Hentikan
                                </button>
                            ) : (
                                <button type="button" onClick={startScan} className={buttonClass('primary', 'sm')}>
                                    <Camera className="size-3.5" /> Mulai Scan
                                </button>
                            )}
                        />
                        <div className="p-5">
                            <div className={cn('relative overflow-hidden rounded-2xl border-2 border-dashed bg-slate-900/95', scanning ? 'border-brand-400' : 'border-slate-200')}>
                                <div id="qr-reader" className="mx-auto w-full max-w-md [&_video]:rounded-xl" />
                                {!scanning && (
                                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                        <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-brand-300">
                                            <QrCode className="size-8" />
                                        </span>
                                        <p className="mt-4 text-sm font-semibold text-white">Kamera belum aktif</p>
                                        <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">
                                            Tekan “Mulai Scan” dan izinkan akses kamera. Label QR berisi tautan langsung ke halaman aset.
                                        </p>
                                    </div>
                                )}
                            </div>
                            {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-600">{error}</p>}
                            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
                                <Smartphone className="size-4 shrink-0 text-slate-400" />
                                Pemindaian bekerja paling baik melalui kamera belakang pada ponsel. Untuk perangkat tanpa kamera, gunakan pencarian kode di samping.
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Hasil pencarian" description={lastCode ? `Kode: ${lastCode}` : 'Belum ada pencarian'} icon={CheckCircle2} />
                        {loading && <p className="px-5 py-8 text-center text-xs text-slate-400">Mencari aset…</p>}
                        {!loading && matches.length === 0 && (
                            <p className="px-5 py-8 text-center text-xs text-slate-400">
                                {lastCode ? 'Aset tidak ditemukan. Periksa kembali kode pada label.' : 'Hasil pemindaian atau pencarian akan muncul di sini.'}
                            </p>
                        )}
                        <div className="divide-y divide-slate-50">
                            {matches.map((match) => (
                                <Link key={match.id} href={match.url} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
                                    <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><QrCode className="size-4" /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-slate-800">{match.name}</p>
                                        <p className="text-[10px] text-slate-500">{match.code} · {match.category} · {match.room ?? 'Tanpa ruangan'}</p>
                                    </div>
                                    <Badge color="emerald">{match.status}</Badge>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card>
                        <CardHeader title="Cari manual" description="Masukkan kode aset" icon={Search} />
                        <form onSubmit={submitManual} className="p-5">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={manual}
                                    onChange={(event) => setManual(event.target.value)}
                                    placeholder="Contoh: PRY-0001"
                                    className="w-full rounded-xl border border-slate-300 py-2.5 pr-3 pl-9 text-sm uppercase placeholder:normal-case focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                                />
                            </div>
                            <button type="submit" disabled={loading || !manual.trim()} className={buttonClass('primary', 'md', 'mt-3 w-full')}>
                                {loading ? 'Mencari…' : 'Cari Aset'}
                            </button>
                        </form>
                    </Card>

                    <Card>
                        <CardHeader title="Aset terbaru" description="Ditambahkan terakhir" icon={QrCode} />
                        <div className="divide-y divide-slate-50">
                            {recent.map((asset) => (
                                <Link key={asset.id} href={`/aset/${asset.id}`} className="flex items-center gap-2 px-5 py-2.5 transition hover:bg-slate-50">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-slate-800">{asset.name}</p>
                                        <p className="font-mono text-[10px] text-slate-400">{asset.code}</p>
                                    </div>
                                    <Badge status={asset.status} />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
