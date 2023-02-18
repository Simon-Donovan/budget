import { num } from "./util";

export function transformRawData(raw) {
    let nextDate = new Date(raw.start);
    let currentBalance;
    let current;
    let history = [];
    let runningBalance = {
        labels: [],
        data: []
    };
    let weeklyBalance;

    raw.daily.forEach(day => {
        const [balance, credit, exclusions] = day;

        if (currentBalance) {
            const debits = balance - currentBalance + credit - exclusions;

            if (current?.data.length === 8) {
                history.unshift(current);
                current = undefined;
            }

            if (!current) {
                weeklyBalance = debits;
                current = {
                    title: `Week starting ${nextDate.toLocaleDateString('en-AU')}`,
                    data: [0, +weeklyBalance.toFixed(2)]
                };
            } else {
                weeklyBalance += debits;
                current.data.push(+weeklyBalance.toFixed(2));
            }
        }

        currentBalance = balance;
        runningBalance.labels.push(`${nextDate.getDate()}/${nextDate.getMonth() + 1}`);
        runningBalance.data.push(balance);

        nextDate.setDate(nextDate.getDate() + 1);
    });

    return { nextDate, currentBalance, current, history, runningBalance };
}

export function add(
    { nextDate, currentBalance, current, history, runningBalance },
    { balance, credit, exclusions }
) {
    nextDate = new Date(nextDate);

    const debits = num(balance) - currentBalance + num(credit) - num(exclusions);

    if (current.data.length === 8) {
        history = [current, ...history];
        current = {
            title: `Week starting ${nextDate.toLocaleDateString('en-AU')}`,
            data: [0, +debits.toFixed(2)]
        };
    } else {
        current = {
            ...current,
            data: [...current.data, +(current.data[current.data.length - 1] + debits).toFixed(2)]
        }
    }

    currentBalance = num(balance);
    runningBalance = {
        labels: [...runningBalance.labels, `${nextDate.getDate()}/${nextDate.getMonth() + 1}`],
        data: [...runningBalance.data, currentBalance]
    };

    nextDate.setDate(nextDate.getDate() + 1);

    return { nextDate, currentBalance, current, history, runningBalance };
}
