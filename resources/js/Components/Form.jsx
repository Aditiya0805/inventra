import { cn } from '../lib/utils';

function Wrapper({ label, htmlFor, error, hint, required, children, className }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-700">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
            )}
            {children}
            {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
            {!error && hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
        </div>
    );
}

const baseField =
    'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500';

export function Input({ label, error, hint, required, className, wrapperClass, id, ...props }) {
    return (
        <Wrapper label={label} htmlFor={id} error={error} hint={hint} required={required} className={wrapperClass}>
            <input id={id} className={cn(baseField, error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10', className)} {...props} />
        </Wrapper>
    );
}

export function Textarea({ label, error, hint, required, className, wrapperClass, id, rows = 3, ...props }) {
    return (
        <Wrapper label={label} htmlFor={id} error={error} hint={hint} required={required} className={wrapperClass}>
            <textarea rows={rows} id={id} className={cn(baseField, 'resize-none', error && 'border-rose-400', className)} {...props} />
        </Wrapper>
    );
}

export function Select({ label, error, hint, required, className, wrapperClass, id, children, placeholder, ...props }) {
    return (
        <Wrapper label={label} htmlFor={id} error={error} hint={hint} required={required} className={wrapperClass}>
            <select id={id} className={cn(baseField, 'pr-9', error && 'border-rose-400', className)} {...props}>
                {placeholder && <option value="">{placeholder}</option>}
                {children}
            </select>
        </Wrapper>
    );
}

export function Checkbox({ label, description, error, className, id, ...props }) {
    return (
        <div className={cn('flex items-start gap-2.5', className)}>
            <input
                id={id}
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500/30"
                {...props}
            />
            <div>
                <label htmlFor={id} className="text-xs font-semibold text-slate-700">
                    {label}
                </label>
                {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
                {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
            </div>
        </div>
    );
}

export function Toggle({ checked, onChange, label, description }) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <div>
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
                    checked ? 'bg-brand-600' : 'bg-slate-300',
                )}
            >
                <span
                    className={cn(
                        'inline-block size-4.5 transform rounded-full bg-white shadow transition',
                        checked ? 'translate-x-5.5' : 'translate-x-1',
                    )}
                />
            </button>
        </label>
    );
}
