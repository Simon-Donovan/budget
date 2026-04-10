export type Tab = 'current' | 'archive';

interface HeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
    const tabBase =
        'px-4 py-2 text-sm font-medium rounded-t transition-colors duration-150 focus:outline-none';
    const activeClass =
        'bg-white text-slate-800 border border-b-white border-slate-200 -mb-px';
    const inactiveClass =
        'text-slate-500 hover:text-slate-700 hover:bg-slate-100';

    return (
        <header className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
                <div className="flex items-center gap-3">
                    <img
                        src="/favicon.ico"
                        alt="Budget icon"
                        className="h-7 w-7 rounded-sm"
                    />
                    <span className="text-slate-800 font-semibold text-base tracking-tight">
                        Budget
                    </span>
                </div>
                <nav className="flex items-end gap-1 h-full pt-2">
                    <button
                        className={`${tabBase} ${activeTab === 'current' ? activeClass : inactiveClass}`}
                        onClick={() => onTabChange('current')}
                    >
                        Current Month
                    </button>
                    <button
                        className={`${tabBase} ${activeTab === 'archive' ? activeClass : inactiveClass}`}
                        onClick={() => onTabChange('archive')}
                    >
                        Archive
                    </button>
                </nav>
            </div>
        </header>
    );
}
