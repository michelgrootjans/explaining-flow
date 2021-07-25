function CumulativeFlowDiagram($chart, stats) {
  const ctx = $chart.getContext('2d');

  const labels = [];

  function createDataSet(stat) {
    return {
      label: stat.name,
      type: 'line',
      lineTension: 0,
      data: [stat.value],
      borderWidth: 1,
      pointRadius: 0.5,
      yAxisID: 'left-y-axis',
    };
  }

  const data = {
    labels,
    datasets: stats.current().reverse().map(createDataSet)
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
      }
    }
  });
  const dataSetFor = name => data.datasets.find(dataset => dataset.label === name);

  const pollStats = () => {
    debugger
    data.labels.push(new Date())
    stats.current()
      .forEach(stat => dataSetFor(stat.name).data.push(stat.value))
    chart.update()
  };

  let timerId = setInterval(pollStats, 1000);
  setTimeout(() => clearInterval(timerId), 60 * 1000);
}

module.exports = CumulativeFlowDiagram