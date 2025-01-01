import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopProductsChart = ({ topProducts }) => {
    if (!topProducts || topProducts.length === 0) {
        return <div>No data available</div>;
    }

    const data = {
        labels: topProducts.map(product => product.product_name),
        datasets: [
            {
                label: 'Total Sold',
                data: topProducts.map(product => product.total_sold),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Revenue',
                data: topProducts.map(product => product.total_revenue),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        indexAxis: 'y',
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Top Selling Products',
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                stacked: false,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default TopProductsChart;
