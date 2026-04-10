export interface RawData {
    start: string;
    daily: [number, number][];
}

export async function getData(): Promise<RawData> {
    const res = await fetch('/api/data');
    return res.json();
}

export async function postFetchBalance(): Promise<RawData> {
    const res = await fetch('/api/data/fetch-balance', { method: 'POST' });
    return res.json();
}

export async function postAdd(date: string, { available, credit }: { available: string; credit: string }): Promise<void> {
    await fetch('/api/data/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([date, available, credit])
    });
}
