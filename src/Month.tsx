import { Line } from 'react-chartjs-2';
import { MONTHLY_TARGET } from './constants';

interface MonthProps {
    title: string;
    labels: string[];
    data: number[];
}

export default function Month({ title, labels, data }: MonthProps) {
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: title,
            },
        },
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Progress',
                data,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Target',
                spanGaps: true,
                data: [0, ...Array(labels.length - 2).fill(null), MONTHLY_TARGET],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return <Line options={options} data={chartData} />;
}
