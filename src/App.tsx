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

const callOnce = createCallOnce();
const blankForm = { available: '', credit: '' };

export default function App() {
    const [data, setData] = useState<AppData | undefined>();
    const [form, setForm] = useState(blankForm);
    const [saving, setSaving] = useState<boolean | undefined>();
    const [activeTab, setActiveTab] = useState<Tab>('current');

    function handleChange(event: React.ChangeEvent<HTMLInputElement>, name: 'available' | 'credit') {
        setForm({ ...form, [name]: event.target.value.replace(/,/g, '') });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        await postAdd(data!.nextDate.toLocaleDateString('en-AU'), form);
        setSaving(false);
        setData(add(data!, form));
        setForm(blankForm);
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
                                    revisedDailyTarget={+((MONTHLY_TARGET - data.current!.data[data.current!.data.length - 1]) / (data.current!.labels.length - data.current!.data.length)).toFixed(2)}
                                    recentDays={Array.from({ length: Math.min(5, data.current!.data.length - 2) }, (_, i) => {
                                        const idx = data.current!.data.length - 2 - i;
                                        return {
                                            label: data.current!.labels[idx],
                                            spend: +(data.current!.data[idx] - data.current!.data[idx - 1]).toFixed(2),
                                        };
                                    })}
                                />
                            </div>

                            {saving ? (
                                <p className="text-slate-500 text-sm">Saving…</p>
                            ) : (
                                <div className="space-y-6">
                                    <section>
                                        <h2 className="text-base font-semibold text-slate-700 mb-2">
                                            Automatic
                                        </h2>
                                        <button
                                            onClick={onFetchBalance}
                                            className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition-colors"
                                        >
                                            Fetch Balance
                                        </button>
                                    </section>

                                    <section>
                                        <h2 className="text-base font-semibold text-slate-700 mb-2">
                                            Manual
                                        </h2>
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
                                                className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </form>
                                    </section>
                                </div>
                            )}
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
