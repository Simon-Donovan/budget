import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
} from 'chart.js';
import { getData, postFetchBalance, postAdd } from './api';
import { createCallOnce } from './util';
import { add, transformRawData, AppData } from './data';
import Month from './Month';
import Header, { Tab } from './Header';
import Sidebar from './Sidebar';
import { MONTHLY_TARGET } from './constants';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip
);

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

const callOnce = createCallOnce();
const blankForm = { available: '', credit: '' };

export default function App() {
    const [data, setData] = useState<AppData | undefined>();
    const [form, setForm] = useState(blankForm);
    const [saving, setSaving] = useState<boolean | undefined>();
    const [activeTab, setActiveTab] = useState<Tab>('current');
    const [showManualForm, setShowManualForm] = useState(false);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>, name: 'available' | 'credit') {
        setForm({ ...form, [name]: event.target.value.replace(/[$,\s]/g, '') });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        await postAdd(data!.nextDate.toLocaleDateString('en-AU'), form);
        setSaving(false);
        setData(add(data!, form));
        setForm(blankForm);
        setShowManualForm(false);
    }

    useEffect(() => {
        callOnce(async () => setData(transformRawData(await getData())));
    }, []);

    async function onFetchBalance() {
        setSaving(true);
        setData(transformRawData(await postFetchBalance()));
        setSaving(false);
        setForm(blankForm);
    }

    return (
        <div className="min-h-screen bg-white">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            {!data ? (
                <div className="max-w-5xl mx-auto px-6 py-10 text-slate-500">
                    Loading…
                </div>
            ) : (
                <main className="max-w-5xl mx-auto px-6 py-8">

                    {activeTab === 'current' && (
                        <>
                            <div className="flex gap-6 items-start mb-10">
                                <div className="flex-1">
                                    <Month {...data.current!} />
                                </div>
                                <Sidebar
                                    currentSpend={+(data.current!.data[data.current!.data.length - 1] - data.current!.data[data.current!.data.length - 2]).toFixed(2)}
                                    targetToday={+(MONTHLY_TARGET / (data.current!.labels.length - 1)).toFixed(2)}
                                    variance={+(data.current!.data[data.current!.data.length - 1] - MONTHLY_TARGET * (data.current!.data.length - 1) / (data.current!.labels.length - 1)).toFixed(2)}
                                    revisedDailyTarget={data.current!.labels.length > data.current!.data.length
                                        ? +((MONTHLY_TARGET - data.current!.data[data.current!.data.length - 1]) / (data.current!.labels.length - data.current!.data.length)).toFixed(2)
                                        : null}
                                    recentDays={Array.from({ length: Math.min(5, data.current!.data.length - 2) }, (_, i) => {
                                        const idx = data.current!.data.length - 2 - i;
                                        return {
                                            label: data.current!.labels[idx],
                                            spend: +(data.current!.data[idx] - data.current!.data[idx - 1]).toFixed(2),
                                        };
                                    })}
                                />
                            </div>

                            <div>
                                {!showManualForm && (
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={onFetchBalance}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-70 transition-colors"
                                        >
                                            {saving && <Spinner />}
                                            Fetch Today's Balance
                                        </button>
                                        <span className="text-sm text-slate-400">
                                            or{' '}
                                            <button
                                                onClick={() => setShowManualForm(true)}
                                                className="hover:text-slate-600 underline underline-offset-2 transition-colors"
                                            >
                                                enter manually
                                            </button>
                                        </span>

                                    </div>
                                )}

                                {showManualForm && (
                                    <form onSubmit={handleSubmit} className="flex items-end gap-4">
                                        <label className="flex flex-col gap-1 text-sm text-slate-600">
                                            Available
                                            <input
                                                type="text"
                                                required
                                                value={form.available}
                                                onChange={e => handleChange(e, 'available')}
                                                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1 text-sm text-slate-600">
                                            Credit
                                            <input
                                                type="text"
                                                value={form.credit}
                                                onChange={e => handleChange(e, 'credit')}
                                                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-70 transition-colors"
                                        >
                                            {saving && <Spinner />}
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowManualForm(false); setForm(blankForm); }}
                                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'archive' && (
                        <div className="space-y-12">
                            {data.history.map(month => (
                                <div key={month.title}>
                                    <Month {...month} />
                                </div>
                            ))}
                        </div>
                    )}

                </main>
            )}
        </div>
    );
}
