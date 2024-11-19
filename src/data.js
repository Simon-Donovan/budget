import { num } from "./util";

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

function formateDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function getMonthMetadata(nextDate) {
    const day = new Date(nextDate);
    const labels = ['', formateDate(day)];
    const monthEnd = new Date(nextDate);

    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(monthEnd.getDate() - 1);

    const title = `${months[monthEnd.getMonth()]} ${monthEnd.getFullYear()}`;

    while (day < monthEnd) {
        day.setDate(day.getDate() + 1);

        labels.push(formateDate(day));
    }

    return { title, labels, monthEnd };
}

export function transformRawData(raw) {
    let nextDate = new Date(raw.start);
    let monthEnd = new Date(nextDate);
    let currentAvailable;
    let current;
    let history = [];
    let totalSpent;

    raw.daily.forEach(day => {
        const [available, credit] = day;

        if (currentAvailable) {
            const spent = currentAvailable + credit - available;

            if (nextDate > monthEnd) {
                if (current) {
                    history.unshift(current);
                }

                const { title, labels, monthEnd: newMonthEnd } = getMonthMetadata(nextDate);

                totalSpent = spent;
                monthEnd = newMonthEnd;

                current = {
                    title,
                    labels,
                    data: [0, +totalSpent.toFixed(2)]
                };
            } else {
                totalSpent += spent;
                current.data.push(+totalSpent.toFixed(2));
            }
        }

        currentAvailable = available;

        nextDate.setDate(nextDate.getDate() + 1);
    });

    return { nextDate, currentAvailable, current, history };
}

export function add(
    { nextDate, currentAvailable, current, history },
    { available, credit }
) {
    nextDate = new Date(nextDate);

    const spent = currentAvailable + num(credit) - num(available);

    if (current.data.length === current.labels.length) {
        history = [current, ...history];

        const { title, labels } = getMonthMetadata(nextDate);

        current = {
            title,
            labels,
            data: [0, +spent.toFixed(2)]
        };
    } else {
        current = {
            ...current,
            data: [...current.data, +(current.data[current.data.length - 1] + spent).toFixed(2)]
        }
    }

    currentAvailable = num(available);

    nextDate.setDate(nextDate.getDate() + 1);

    return { nextDate, currentAvailable, current, history };
}
