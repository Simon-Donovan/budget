interface DayEntry {
    label: string;
    spend: number;
}

interface SidebarProps {
    currentSpend: number;
    targetToday: number;
    revisedDailyTarget: number;
    recentDays: DayEntry[];
}

const fmt = (n: number) =>
    n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Sidebar({ currentSpend, targetToday, revisedDailyTarget, recentDays }: SidebarProps) {
    const onTarget = currentSpend <= targetToday;
    const spendColor = onTarget ? 'text-green-500' : 'text-red-500';

    return (
        <div className="shrink-0 w-40 pt-8">
            <div className="w-40 rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Today subtitle */}
                <div className="px-4 pt-3 pb-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Today</span>
                </div>

                {/* Spend / target with diagonal line */}
                <div className="relative h-16 overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 160 64"
                        preserveAspectRatio="none"
                    >
                        <line
                            x1="15" y1="50"
                            x2="145" y2="14"
                            stroke="#94a3b8"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute top-2 left-4">
                        <div className={`text-xl font-bold leading-none tabular-nums ${spendColor}`}>
                            ${fmt(currentSpend)}
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-4 text-right">
                        <div className="text-xl font-bold leading-none tabular-nums text-slate-400">
                            ${fmt(targetToday)}
                        </div>
                    </div>
                </div>

                {/* Revised target subsection */}
                <div className="px-4 pt-3 pb-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Revised Target</span>
                </div>
                <div className="px-4 pb-3">
                    <span className="text-xl font-bold tabular-nums text-slate-700">
                        ${fmt(revisedDailyTarget)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ day</span>
                </div>

                {/* Recent subtitle */}
                <div className="px-4 pt-3 pb-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Recent</span>
                </div>

                {/* Past days list */}
                <div className="px-4 pb-3 space-y-1">
                    {recentDays.map(({ label, spend }) => (
                        <div key={label} className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-400">{label}</span>
                            <span className={`text-sm font-semibold tabular-nums ${spend <= targetToday ? 'text-green-500' : 'text-red-500'}`}>
                                ${fmt(spend)}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
