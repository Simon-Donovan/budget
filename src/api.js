export async function getData() {
    const res = await fetch('/api/data');

    return await res.json();
}

export async function postFetchBalance() {
    const res = await fetch('/api/data/fetch-balance', { method: 'POST' });

    return await res.json();
}

export async function postAdd(date, { available, credit }) {
    await fetch('/api/data/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([date, available, credit])
    });
}
