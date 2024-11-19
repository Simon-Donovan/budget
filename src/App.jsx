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
import { getData, postAdd } from './api';
import { createCallOnce } from './util';
import { add, transformRawData } from './data';
import Month from './Month';

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
    const [data, setData] = useState();
    const [form, setForm] = useState(blankForm);
    const [saving, setSaving] = useState();

    function handleChange(event, name) {
        setForm({ ...form, [name]: event.target.value.replace(/,/g, '') });
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
                <Month {...data.current} />
            </div>
            {saving ? <div>Saving...</div> :
                <form onSubmit={handleSubmit}>
                    <label>
                        Available:
                        <input type="text" required value={form.available} onChange={event => handleChange(event, 'available')} />
                    </label>
                    <label>
                        Credit:
                        <input type="text" value={form.credit} onChange={event => handleChange(event, 'credit')} />
                    </label>
                    <button type="submit">Add</button>
                </form>
            }
            {data.history.map(month =>
                <div key={month.title} className="chart">
                    <Month {...month} />
                </div>
            )}
        </>;
}
