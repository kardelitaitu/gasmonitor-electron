import './index.css';
import { Chart, registerables } from 'chart.js';
import { GasTrackerData } from './config'; // Import GasTrackerData

Chart.register(...registerables);

// Define the API on the window object
declare global {
  interface Window {
    api: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      getWindowSize: () => Promise<[number, number]>;
      getWindowContentSize: () => Promise<[number, number]>;
      resize: (options: { width: number, height: number }) => void;
      findLowestGasFee: () => Promise<GasTrackerData>; // Changed return type
    };
  }
}

let gasChart: Chart | null = null; // Keep a reference to the chart instance

// Function to render a basic chart
const renderChart = (chartData: { labels: string[]; data: { value: number; relativeTime: string }[] }) => { // Updated chartData type
  const ctx = document.getElementById('gas-chart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Renderer: Canvas element with ID "gas-chart" not found.');
    return;
  }

  console.log('DEBUG: Chart data received:', chartData); // Log chart data

  if (gasChart) {
    gasChart.destroy(); // Destroy existing chart before creating a new one
  }

  const dataValues = chartData.data.map(item => item.value); // Extract values explicitly

  // --- DYNAMIC Y-AXIS LOGIC ---
  let yMin = 0;
  let yMax = 1; // Default if no data

  if (dataValues.length > 0) {
    const dataMin = Math.min(...dataValues);
    const dataMax = Math.max(...dataValues);
    const dataRange = dataMax - dataMin;

    // Calculate margin (10% of the range, or 10% of the value if range is 0)
    let margin = dataRange === 0 ? dataMax * 0.1 : dataRange * 0.1;

    // Ensure margin is a small number if all data is 0
    if (margin === 0) {
      margin = 0.01;
    }

    // Apply margins, ensuring min never goes below 0 for gas price
    yMin = Math.max(0, dataMin - margin);
    yMax = dataMax + margin;
  }
  gasChart = new Chart(ctx, {
    type: 'line', // Example chart type
    data: {
      labels: chartData.labels, // Dynamic labels
      datasets: [{
        label: 'Gas Price (Gwei)',
        data: dataValues, // Use the extracted values
        borderColor: '#726fc4', // Changed to bright red
        backgroundColor: '#726fc4', // Light red fill
        pointBackgroundColor: '#E7F2EF', // Red points
        pointBorderColor: '#E7F2EF', // White border for points
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            // --- THIS IS THE FIX ---
            title: function (context) {
              // context[0] is the current hovered item
              const index = context[0].dataIndex;

              // Get the absolute time from the labels array
              const absoluteTime = chartData.labels[index];

              // Get the relative time from the data array
              const relativeTime = chartData.data[index].relativeTime;

              if (absoluteTime && relativeTime) {
                // Combine them as requested
                return `${absoluteTime} ${relativeTime}`;
              }

              // Fallback
              return absoluteTime || '';
            },
            // --- YOUR LABEL CALLBACK IS ALREADY PERFECT ---
            label: function (context) {
              let label = context.dataset.label || '';

              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y.toFixed(5)}`;
              }
              return label;
            },
          }
        }
      },
      scales: {
        x: { // Explicit X-axis configuration
          display: true, // Ensure X-axis is displayed
          title: {
            display: true,
            text: 'Time' // Optional: Add a title to the X-axis
          }
        },
        y: {
          // --- UPDATED ---
          // beginAtZero: true, // <-- Removed
          min: yMin,             // <-- Added
          max: yMax,             // <-- Added
          // --- END UPDATE ---
          title: {
            display: true,
            text: 'Gas Price (Gwei)' // Optional: Add a title to the Y-axis
          }
        }
      }
    }
  });
};

// Function to refresh the gas fee display
const refreshGasFeeDisplay = async () => {
  console.log('DEBUG: refreshGasFeeDisplay called.'); // New log
  const gasFeeResultElement = document.getElementById('gas-fee-result')!;
  const refreshGasFeeBtn = document.getElementById('refresh-gas-btn') as HTMLButtonElement;

  gasFeeResultElement.textContent = 'Fetching gas data...';
  if (refreshGasFeeBtn) { // Add null check
    refreshGasFeeBtn.disabled = true;
  }

  try {
    const result = await window.api.findLowestGasFee(); // Now returns GasTrackerData
    console.log('Renderer: Lowest gas fee result:', result.lowestGweiResult);
    console.log('DEBUG: Result object from findLowestGasFee:', result); // New log
    gasFeeResultElement.textContent = result.lowestGweiResult;
    renderChart(result.chartData); // Pass dynamic chart data
  } catch (error) {
    console.error('Error refreshing gas fee display:', error);
    gasFeeResultElement.textContent = 'Error fetching gas data.';
    renderChart({ labels: [], data: [] }); // Render empty chart on error
  } finally {
    if (refreshGasFeeBtn) { // Add null check
      refreshGasFeeBtn.disabled = false;
    }
  }
};

// Add click listeners to the control buttons
document.getElementById('minimize-btn')?.addEventListener('click', () => {
  window.api.minimize();
});

document.getElementById('maximize-btn')?.addEventListener('click', () => {
  window.api.maximize();
});

document.getElementById('close-btn')?.addEventListener('click', () => {
  window.api.close();
});

// New: Add event listeners for overlay buttons
document.getElementById('refresh-gas-btn')?.addEventListener('click', refreshGasFeeDisplay);


// Removed resizer logic

// Initial chart render on load - now calls refreshGasFeeDisplay to get data
window.addEventListener('DOMContentLoaded', refreshGasFeeDisplay);
