import { cn } from '../lib/utils';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn('min-w-0 rounded-2xl border border-slate-200/80 bg-white card-shadow', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, description, action, icon: Icon, className }) {
    return (
        <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4', className)}>
            <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="size-4.5" />
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                    {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}

export function CardBody({ children, className }) {
    return <div className={cn('p-5', className)}>{children}</div>;
}

export function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'brand',
    className,
    action,
}) {
    const tones = {
        brand: 'bg-brand-50 text-brand-700',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        violet: 'bg-violet-50 text-violet-600',
        slate: 'bg-slate-100 text-slate-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        sky: 'bg-sky-50 text-sky-600',
    };

    return (
        <Card className={cn('relative overflow-hidden p-5', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
                    <p className="tabular mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
                </div>
                {Icon && (
                    <div className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tones[tone] ?? tones.brand)}>
                        <Icon className="size-5" />
                    </div>
                )}
            </div>
            {action}
        </Card>
    );
}

export function SectionTitle({ title, description, action }) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            {action}
        </div>
    );
}
