var Chart = require('chart.js');

function timeFormat(date) {
  return date;
}

function createChart(ctx) {
  const leadTime = [];
  const throughput = [];
  const wip = [];
  let labels = [];

  const data = {
    labels: labels,
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
  var chart = new Chart(ctx, {
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

window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  let state = undefined;

  PubSub.subscribe('board.ready', () => {
    state = createChart(ctx);
    state.chart.update();
  });

  PubSub.subscribe('stats.calculated', (topic, stats) => {
    state.labels.push(new Date());
    state.leadTime.push(stats.sliding.leadTime(5));
    state.throughput.push(stats.sliding.throughput(5));
    state.wip.push(stats.workInProgress);
    let numberOfDatapoints = state.labels.length;
    setTimeout(() => {
      const dataHasNotChanged = numberOfDatapoints === state.labels.length;
      if (dataHasNotChanged) state.chart.update();
    }, 500)
  });
};
