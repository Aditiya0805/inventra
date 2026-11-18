import { cn } from '../lib/utils';

const VARIANTS = {
    primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 focus-visible:outline-brand-700 disabled:bg-brand-300',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600 disabled:bg-rose-300',
    warning: 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 focus-visible:outline-amber-500',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600',
    dark: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-900',
};

const SIZES = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    sm: 'px-3 py-2 text-xs font-semibold gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm font-semibold gap-2 rounded-xl',
    lg: 'px-5 py-3 text-sm font-semibold gap-2 rounded-xl',
    icon: 'p-2 rounded-lg',
};

export function buttonClass(variant = 'primary', size = 'md', className) {
    return cn(
        'inline-flex items-center justify-center font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
    );
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    loading = false,
    icon: Icon,
    ...props
}) {
    return (
        <button
            type={type}
            className={buttonClass(variant, size, className)}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            ) : (
                Icon && <Icon className="size-4" />
            )}
            {children}
        </button>
    );
}
