import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { CHART_COLORS, formatNumber } from '../lib/utils';

const tooltipStyle = {
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px -12px rgba(15,23,42,.25)',
    fontSize: 12,
};

export function SeatDonut({ seats, height = 220 }) {
    const data = [
        { key: 'dipakai', name: 'Dipakai', value: seats.dipakai, color: '#3b82f6' },
        { key: 'tersedia', name: 'Tersedia', value: seats.tersedia, color: '#10b981' },
        { key: 'rusak', name: 'Rusak', value: seats.rusak, color: '#f43f5e' },
        { key: 'perbaikan', name: 'Perbaikan', value: seats.perbaikan, color: '#f59e0b' },
    ].filter((item) => item.value > 0);

    if (!data.length) {
        return <div className="grid h-[220px] place-items-center text-xs text-slate-400">Belum ada data kursi</div>;
    }

    return (
        <div className="relative" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="64%"
                        outerRadius="88%"
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [`${formatNumber(value)} kursi`, name]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular text-2xl font-bold text-slate-900">{formatNumber(seats.total)}</span>
                <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">Total kursi</span>
            </div>
        </div>
    );
}

export function CategoryBar({ data, height = 280 }) {
    if (!data?.length) {
        return <div className="grid h-[280px] place-items-center text-xs text-slate-400">Belum ada data aset</div>;
    }

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-22}
                        textAnchor="end"
                        height={52}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ fill: 'rgba(148,163,184,.08)' }}
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [formatNumber(value), name === 'total' ? 'Total' : 'Rusak']}
                    />
                    <Legend
                        verticalAlign="top"
                        height={28}
                        iconType="circle"
                        iconSize={7}
                        formatter={(value) => (
                            <span className="text-[11px] text-slate-500">{value === 'total' ? 'Total unit' : 'Rusak'}</span>
                        )}
                    />
                    <Bar dataKey="total" name="total" fill="#0d9488" radius={[5, 5, 0, 0]} maxBarSize={34} />
                    <Bar dataKey="rusak" name="rusak" fill="#fda4af" radius={[5, 5, 0, 0]} maxBarSize={34} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RoomStatusDonut({ status }) {
    const data = [
        { name: 'Tersedia', value: status.tersedia ?? 0, color: '#10b981' },
        { name: 'Dipakai', value: status.dipakai ?? 0, color: '#3b82f6' },
        { name: 'Dipesan', value: status.dipesan ?? 0, color: '#f59e0b' },
        { name: 'Perawatan', value: (status.perawatan ?? 0) + (status.ditutup ?? 0), color: '#94a3b8' },
    ].filter((item) => item.value > 0);

    if (!data.length) {
        return <div className="grid h-[180px] place-items-center text-xs text-slate-400">Belum ada ruangan</div>;
    }

    return (
        <div className="relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} ruangan`, name]} />
                </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular text-xl font-bold text-slate-900">{data.reduce((sum, d) => sum + d.value, 0)}</span>
                <span className="text-[10px] text-slate-400">ruangan</span>
            </div>
        </div>
    );
}

export function SimpleBar({ items }) {
    return (
        <div className="space-y-3">
            {items.map((item) => {
                const color = CHART_COLORS[item.color] ?? CHART_COLORS.teal;
                return (
                    <div key={item.name}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-600">{item.name}</span>
                            <span className="tabular font-semibold text-slate-900">{formatNumber(item.value)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${item.percent}%`, backgroundColor: color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
