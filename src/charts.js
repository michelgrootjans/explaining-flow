var Chart = require('chart.js');

function timeFormat(date) {
  return date;
}

window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  const leadTime = [];
  const throughput = [];
  const wip = [];

  const data = {
    labels: [],
    datasets: [
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
      {
        label: 'throughput (a.k.a. velocity)',
        type: 'line',
        lineTension: 0,
        data: throughput,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 0.5,
        yAxisID: 'right-y-axis',
      },
    ]
  };
  var myChart = new Chart(ctx, {
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
          scaleLabel: {
            display: true,
            labelString: 'lead time + WIP'
          }
        },{
          id: 'right-y-axis',
          type: 'linear',
          position: 'right',
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'throughput'
          }
        }]
      }
    }
  });

  let counter = 0;
  PubSub.subscribe('stats.calculated', (topic, stats) => {
    data.labels.push(new Date());
    leadTime.push(stats.sliding.leadTime(5));
    throughput.push(stats.sliding.throughput(5));
    wip.push(stats.workInProgress);
    let numberOfDatapoints = data.labels.length;
    setTimeout(() => {
      const dataHasNotChanged = numberOfDatapoints === data.labels.length;
      if (dataHasNotChanged) myChart.update();
    }, 500)
  });
};
