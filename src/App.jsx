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
import Week from './Week';
import RunningBalance from './RunningBalance';
import { getData, postAdd } from './api';
import { createCallOnce } from './util';
import { add, transformRawData } from './data';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip
);

const callOnce = createCallOnce();
const blankForm = { balance: '', credit: '', exclusions: '' };

export default function App() {
    const [data, setData] = useState();
    const [form, setForm] = useState(blankForm);
    const [saving, setSaving] = useState();

    function handleChange(event, name) {
        setForm({ ...form, [name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);

        await postAdd(data.nextDate.toLocaleDateString('en-AU'), form);

        setSaving(false);
        setData(add(data, form));
        setForm(blankForm);
    }

    useEffect(() => {
        callOnce(async () => setData(transformRawData(await getData())));
    }, []);

    return !data ? <div>Loading...</div> :
        <>
            <div className="chart">
                <Week {...data.current} />
            </div>
            {saving ? <div>Saving...</div> :
                <form onSubmit={handleSubmit}>
                    <label>
                        Balance:
                        <input type="text" required value={form.balance} onChange={event => handleChange(event, 'balance')} />
                    </label>
                    <label>
                        Credit:
                        <input type="text" value={form.credit} onChange={event => handleChange(event, 'credit')} />
                    </label>
                    <label>
                        Exclusions:
                        <input type="text" value={form.exclusions} onChange={event => handleChange(event, 'exclusions')} />
                    </label>
                    <button type="submit">Add</button>
                </form>
            }
            <div className="chart">
                <RunningBalance {...data.runningBalance} />
            </div>
            {data.history.map(week =>
                <div key={week.title} className="chart">
                    <Week {...week} />
                </div>
            )}
        </>;
}
