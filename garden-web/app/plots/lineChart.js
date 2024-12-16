import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: { min: 0, max: 110 },
    y1: {
      min: 0,
      max: 100,
      type: 'linear',
      position: 'right',
      grid: { drawOnChartArea: false },
    },
  },
};

function LineChart({ selectedPlot }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (selectedPlot !== null) {
      fetch(`/api/plots/${selectedPlot}`)
        .then(res => res.json())
        .then(data => {
          let temperatureData = [];
          let humidityData = [];

          // Process temperature and humidity data
          data.Items.forEach((item, index, array) => {
            if (item.temperature && item.humidity) {
              if (parseFloat(item.humidity.S) > 1016 || parseFloat(item.temperature) === 0)
                return;
              if (index !== 0 && parseFloat(item.temperature.S) - parseFloat(array[index - 1].temperature.S) > 5)
                return;
              if (index !== 0 && parseFloat(item.humidity.S) - parseFloat(array[index - 1].humidity.S) > 300)
                return;
              const date = new Date(item.timestamp.N * 1000);
              temperatureData.push({ date: date, y: item.temperature.N * 9 / 5 + 32 });
              humidityData.push({ date: date, y1: item.humidity.N });
            }
          });

          setChartData({
            labels: temperatureData.map(item => item.date.toLocaleString()),
            datasets: [
              {
                label: 'Temperature',
                data: temperatureData.map(item => item.y),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
              },
              {
                label: 'Mositure',
                data: humidityData.map(item => item.y1),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                yAxisID: 'y1',
              },
            ]
          });
        });
    }
  }, [selectedPlot]);

  return (
    <div style={{ width: '100%', height: '50vh' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

LineChart.propTypes = {
  selectedPlot: PropTypes.string.isRequired,
};

export default LineChart;
