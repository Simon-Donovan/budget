import { Line } from 'react-chartjs-2';

export default function RunningBalance({ labels, data }) {
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Running Balance',
            },
        },
        scales: {
            x: {
                display: false
            }
        }
    };

    const chartData = {
        labels,
        datasets: [
            {
                data,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return <Line options={options} data={chartData} />;
}