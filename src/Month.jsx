import { Line } from 'react-chartjs-2';

export default function Month({ title, labels, data }) {
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
                data: [0, ...Array(labels.length - 2).fill(null), 3500],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return <Line options={options} data={chartData} />;
}