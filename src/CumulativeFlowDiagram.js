const Chart = require('chart.js');

const colors = {
  Backlog: {border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)'},
  ux: {border: 'rgba(255, 159, 64, 1)', background: 'rgba(255, 159, 64, 0.2)'},
  dev: {border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)'},
  qa: {border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)'},
  Done: {border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)'}
}

function getColorFor(stat) {
  return colors[stat.name] || {border: 'rgba(128, 128, 128, 1)', background: 'rgba(128, 128, 128, 0.2)'};
}

function CumulativeFlowDiagram($chart, stats) {
  const ctx = $chart.getContext('2d');

  const labels = [];

  function createDataSet(stat) {
    return {
      label: stat.name,
      type: 'line',
      lineTension: 0,
      data: [],
      borderColor: getColorFor(stat).border,
      backgroundColor: getColorFor(stat).background,
      borderWidth: 1,
      pointRadius: 0.5,
      yAxisID: 'left-y-axis',
    };
  }

  const data = {
    labels,
    datasets: [...stats.current()].reverse().map(createDataSet)
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
          stacked: true
        }]
      },
      plugins:{
        filler: {
          propagate: false
        },
      }
    }
  });
  const dataSetFor = name => data.datasets.find(dataset => dataset.label === name);

  const pollStats = () => {
    data.labels.push(new Date())
    stats.current()
      .forEach(stat => dataSetFor(stat.name).data.push(stat.value))
    chart.update()
    if (stats.done()) {
      clearInterval(timerId);
      chart.update();
    }
  };

  let timerId = setInterval(pollStats, 1000);
}

module.exports = CumulativeFlowDiagram