var Chart = require('chart.js');

function timeFormat(date){
  return date;
}

window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  const data = {
    labels: [],
    datasets: [
      {
        label: 'leadtime',
        type: 'line',
        lineTension: 0,
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }, {
        label: 'throughput',
        type: 'line',
        lineTension: 0,
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }, {
        label: 'wip',
        type: 'line',
        steppedLine: true,
        lineTension: 0,
        data: [],
        backgroundColor: 'rgba(255, 206, 86, 0)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }]
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
          time: {
            // parser: timeFormat
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

  let counter = 0;
  PubSub.subscribe('stats.calculated', (topic, stats) => {
    data.labels.push(new Date());
    data.datasets[0].data.push(stats.sliding.leadTime(5));
    data.datasets[1].data.push(stats.sliding.throughput(5));
    data.datasets[2].data.push(stats.workInProgress);
    let numberOfDatapoints = data.labels.length;
    setTimeout(() => {
      const dataHasNotChanged = numberOfDatapoints === data.labels.length;
      if(dataHasNotChanged) myChart.update();
    }, 500)
  });
};
