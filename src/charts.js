const Chart = require('chart.js');
const {subscribe} = require('../src/publish-subscribe')

function createChart(ctx,speed) {
  const leadTime = [];
  const throughput = [];
  const wip = [];
  const labels = [];
  const startTime = new Date();

  const data = {
    labels,
    datasets: [
      {
        label: 'throughput',
        type: 'line',
        lineTension: 0,
        data: throughput,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: true,
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: 'leadtime',
        type: 'line',
        lineTension: 0,
        data: leadTime,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: 'wip',
        type: 'line',
        steppedLine: true,
        lineTension: 0,
        data: wip,
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        borderColor: 'rgba(255, 206, 86, 1)',
        fill: true,
        stepped: true,
        borderWidth: 1,
        pointRadius: 0,
      },
    ]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      animation: false,
      scales: {
        x: {
          type: 'linear'
        },
        y: {
          type: 'linear',
          ticks: {mirror: true},
          position: 'left'
        },
      },
      plugins: {
        legend: {display: true, position: 'bottom', align: 'start'},
        title: {
          display: true,
          text: 'Flow metrics'
        }
      }
    }
  };
  const chart = new Chart(ctx, config);
  return {leadTime, throughput, wip, data, chart, labels, startTime};
}

function xValue(startTime, speed) {
  const currentTime = new Date();
  return (currentTime - startTime) * speed / 1000;
}

function LineChart($chart, updateInterval, speed) {
  const ctx = $chart.getContext('2d');

  let state = createChart(ctx, speed);
  subscribe('board.ready', () => {
    const timerId = setInterval(() => state.chart.update(), updateInterval);
    subscribe('board.done', () => {
      clearInterval(timerId);
      state.chart.update()
    });

    subscribe('stats.calculated', (topic, stats) => {
      const {leadTime, throughput} = stats.sliding.performance(10);

      state.labels.push(xValue(state.startTime, speed));
      state.leadTime.push(leadTime);
      state.throughput.push(throughput);
      state.wip.push(stats.workInProgress);
    });
  });

  return state.chart;
}

module.exports = LineChart