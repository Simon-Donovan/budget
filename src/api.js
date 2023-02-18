export async function getData() {
    const res = await fetch('/api/data');

    return await res.json();
}

export async function postAdd(date, { balance, credit, exclusions }) {
    await fetch('/api/data/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([date, balance, credit, exclusions])
    });
}
