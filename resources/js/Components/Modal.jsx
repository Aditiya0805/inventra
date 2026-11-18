import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = 'max-w-lg',
    icon: Icon,
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={cn(
                    'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
                    maxWidth,
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start gap-3">
                        {Icon && (
                            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                <Icon className="size-4.5" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Konfirmasi tindakan',
    description,
    confirmLabel = 'Ya, lanjutkan',
    loading = false,
    danger = true,
    children,
    maxWidth = 'max-w-md',
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            maxWidth={maxWidth}
            footer={
                <>
                    <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            'rounded-lg px-3.5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60',
                            danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-700 hover:bg-brand-800',
                        )}
                    >
                        {loading ? 'Memproses…' : confirmLabel}
                    </button>
                </>
            }
        >
            {children}
        </Modal>
    );
}
