import { cn, statusMeta } from '../lib/utils';

const STYLES = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
    slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
    gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
    lime: 'bg-lime-50 text-lime-700 ring-lime-600/20',
};

export default function Badge({ children, color = 'slate', status, className, dot = false }) {
    const meta = status ? statusMeta(status) : null;
    const tone = meta?.color ?? color;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap',
                STYLES[tone] ?? STYLES.slate,
                className,
            )}
        >
            {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
            {children ?? meta?.label}
        </span>
    );
}
