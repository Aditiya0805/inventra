import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Pagination({ paginator, className }) {
    if (!paginator || paginator.last_page <= 1) return null;

    const links = paginator.links ?? [];

    return (
        <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
            <p className="text-xs text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700">{paginator.from ?? 0}</span>–
                <span className="font-semibold text-slate-700">{paginator.to ?? 0}</span> dari{' '}
                <span className="font-semibold text-slate-700">{paginator.total}</span> data
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, index) => {
                    if (index === 0) {
                        return (
                            <Link
                                key="prev"
                                href={link.url ?? '#'}
                                preserveScroll
                                className={cn(
                                    'grid size-8 place-items-center rounded-lg border text-slate-600 transition',
                                    link.url
                                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                                        : 'border-slate-100 bg-slate-50 text-slate-300',
                                )}
                            >
                                <ChevronLeft className="size-4" />
                            </Link>
                        );
                    }
                    if (index === links.length - 1) {
                        return (
                            <Link
                                key="next"
                                href={link.url ?? '#'}
                                preserveScroll
                                className={cn(
                                    'grid size-8 place-items-center rounded-lg border text-slate-600 transition',
                                    link.url
                                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                                        : 'border-slate-100 bg-slate-50 text-slate-300',
                                )}
                            >
                                <ChevronRight className="size-4" />
                            </Link>
                        );
                    }
                    return (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            preserveScroll
                            className={cn(
                                'grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-semibold transition',
                                link.active
                                    ? 'border-brand-700 bg-brand-700 text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                !link.url && 'pointer-events-none opacity-40',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
