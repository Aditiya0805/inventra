import { cn } from '../lib/utils';

export default function Tabs({ tabs, active, onChange, className, size = 'md' }) {
    return (
        <div className={cn('flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 scrollbar-thin', className)}>
            {tabs.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition',
                            size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs',
                            isActive
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70'
                                : 'text-slate-500 hover:text-slate-800',
                        )}
                    >
                        {tab.icon && <tab.icon className="size-3.5" />}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'tabular rounded-full px-1.5 py-0.5 text-[10px]',
                                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/70 text-slate-500',
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
