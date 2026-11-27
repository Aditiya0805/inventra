export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function formatNumber(value, options = {}) {
    return new Intl.NumberFormat('id-ID', options).format(Number(value ?? 0));
}

export function formatCurrency(value, compact = false) {
    if (compact) {
        const number = Number(value ?? 0);
        if (number >= 1_000_000_000) return `Rp ${(number / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
        if (number >= 1_000_000) return `Rp ${(number / 1_000_000).toFixed(1).replace('.', ',')} jt`;
        if (number >= 1_000) return `Rp ${(number / 1_000).toFixed(0)} rb`;
        return `Rp ${formatNumber(number)}`;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

export function formatDate(value, options = {}) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(date);
}

export function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function formatTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function timeAgo(value) {
    if (!value) return '';
    const date = new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return formatDate(value);
}

export const STATUS_META = {
    tersedia: { label: 'Tersedia', color: 'emerald' },
    dipakai: { label: 'Dipakai', color: 'blue' },
    dipinjam: { label: 'Dipinjam', color: 'indigo' },
    rusak: { label: 'Rusak', color: 'rose' },
    perbaikan: { label: 'Dalam Perbaikan', color: 'amber' },
    hilang: { label: 'Hilang', color: 'slate' },
    dihapuskan: { label: 'Dihapuskan', color: 'zinc' },
    dipesan: { label: 'Dipesan', color: 'amber' },
    perawatan: { label: 'Perawatan', color: 'amber' },
    ditutup: { label: 'Ditutup', color: 'slate' },
    menunggu: { label: 'Menunggu', color: 'amber' },
    disetujui: { label: 'Disetujui', color: 'emerald' },
    ditolak: { label: 'Ditolak', color: 'rose' },
    dikembalikan: { label: 'Dikembalikan', color: 'slate' },
    dibatalkan: { label: 'Dibatalkan', color: 'slate' },
    terlambat: { label: 'Terlambat', color: 'rose' },
    dilaporkan: { label: 'Dilaporkan', color: 'amber' },
    diverifikasi: { label: 'Diverifikasi', color: 'sky' },
    dalam_perbaikan: { label: 'Dalam Perbaikan', color: 'violet' },
    selesai: { label: 'Selesai', color: 'emerald' },
    tidak_dapat_diperbaiki: { label: 'Tidak Dapat Diperbaiki', color: 'rose' },
    rendah: { label: 'Rendah', color: 'slate' },
    sedang: { label: 'Sedang', color: 'amber' },
    tinggi: { label: 'Tinggi', color: 'rose' },
    draft: { label: 'Draft', color: 'amber' },
    aktif: { label: 'Aktif', color: 'emerald' },
    nonaktif: { label: 'Nonaktif', color: 'slate' },
    baik: { label: 'Baik', color: 'emerald' },
};

export function statusMeta(status) {
    return STATUS_META[status] ?? { label: status, color: 'slate' };
}

export const ROLE_LABELS = {
    super_admin: 'Super Admin',
    admin_sarpras: 'Admin Sarpras',
    guru: 'Guru / Staf',
    teknisi: 'Teknisi',
    viewer: 'Viewer',
};

export const CHART_COLORS = {
    emerald: '#10b981',
    teal: '#14b8a6',
    blue: '#3b82f6',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    purple: '#a855f7',
    fuchsia: '#d946ef',
    rose: '#f43f5e',
    amber: '#f59e0b',
    orange: '#f97316',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    slate: '#64748b',
    stone: '#78716c',
    lime: '#84cc16',
    zinc: '#71717a',
};

export function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}

export function percentage(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

export function truncate(text, length = 80) {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length)}…` : text;
}

export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
    if (!file || !file.type || !file.type.startsWith('image/')) return file;
    if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size < 500 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                canvas.toBlob(
                    (blob) => {
                        if (!blob || blob.size >= file.size) {
                            resolve(file);
                        } else {
                            const ext = outType === 'image/jpeg' ? '.jpg' : '.png';
                            const newName = file.name.replace(/\.[^/.]+$/, ext);
                            const newFile = new File([blob], newName, {
                                type: outType,
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        }
                    },
                    outType,
                    quality
                );
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}
