const Chart = require('chart.js');
const PubSub = require("pubsub-js");

function createChart(ctx,speed) {
  const cycleTime = [];
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
        label: 'cycletime',
        type: 'line',
        lineTension: 0,
        data: cycleTime,
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
  return {cycleTime, throughput, wip, data, chart, labels, startTime};
}

function xValue(startTime, speed) {
  const currentTime = new Date();
  return (currentTime - startTime) * speed / 1000;
}

function LineChart($chart, updateInterval, speed) {
  const ctx = $chart.getContext('2d');

  let state = createChart(ctx, speed);
  PubSub.subscribe('board.ready', () => {
    const timerId = setInterval(() => state.chart.update(), updateInterval);
    PubSub.subscribe('board.done', () => {
      clearInterval(timerId);
      state.chart.update()
    });

    PubSub.subscribe('stats.calculated', (topic, stats) => {
      state.labels.push(xValue(state.startTime, speed));
      state.cycleTime.push(stats.sliding.cycleTime(5));
      state.throughput.push(stats.sliding.throughput(5));
      state.wip.push(stats.workInProgress);
    });
  });

  return state.chart;
}

module.exports = LineChart