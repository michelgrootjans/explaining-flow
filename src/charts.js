const Chart = require('chart.js');
const PubSub = require("pubsub-js");

function createChart(ctx) {
  const leadTime = [];
  const throughput = [];
  const wip = [];
  const labels = [];

  const data = {
    labels,
    datasets: [
      {
        label: 'throughput (a.k.a. velocity)',
        type: 'line',
        lineTension: 0,
        data: throughput,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 0.5,
        yAxisID: 'left-y-axis',
      },
      {
        label: 'leadtime',
        type: 'line',
        lineTension: 0,
        data: leadTime,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 0.5,
        yAxisID: 'left-y-axis',
      }, {
        label: 'wip',
        type: 'line',
        steppedLine: true,
        lineTension: 0,
        data: wip,
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 0.5,
        yAxisID: 'left-y-axis',
      },
    ]
  };

  const chart = new Chart(ctx, {
    data: data,
    options: {
      animation: false,
      title: {
        text: 'team flow'
      },
      scales: {
        xAxes: [{
          type: 'time',
        }],
        yAxes: [{
          id: 'left-y-axis',
          type: 'linear',
          position: 'left',
          ticks: {
            beginAtZero: true
          },
        }]
      }
    }
  });
  return {leadTime, throughput, wip, data, chart, labels};
}

function LineChart($chart) {
  const ctx = $chart.getContext('2d');
  let state = undefined;

  PubSub.subscribe('board.ready', () => {
    state && state.chart && state.chart.destroy()
    state = createChart(ctx);
  });

  PubSub.subscribe('stats.calculated', (topic, stats) => {
    state.labels.push(new Date());
    state.leadTime.push(stats.sliding.leadTime(5));
    state.throughput.push(stats.sliding.throughput(5));
    state.wip.push(stats.workInProgress);
    state.chart.update()
  });
}

module.exports = LineChart