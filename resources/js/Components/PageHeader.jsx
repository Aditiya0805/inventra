import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, description, actions, backHref, badge, className }) {
    return (
        <div className={`mb-6 flex flex-wrap items-start justify-between gap-4 ${className ?? ''}`}>
            <div className="flex items-start gap-3">
                {backHref && (
                    <Link
                        href={backHref}
                        className="mt-1 grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                )}
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
                        {badge}
                    </div>
                    {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
