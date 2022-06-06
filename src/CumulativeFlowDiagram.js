const Chart = require('chart.js');
const PubSub = require("pubsub-js");

const distinct = (value, index, self) => self.indexOf(value) === index;

const createDataset = (label, color) => ({
  label: label,
  type: 'line',
  data: [],
  fill: true,
  stepped: true,
  pointRadius: 0,
  backgroundColor: `rgba(${color}, 0.1)`,
  borderColor: `rgba(${color}, 1)`,
  borderWidth: 1,
});

const colors = [
  '101, 103, 107',
  '153, 102, 255',
  '54, 162, 235',
  '75, 192, 192',
  '255, 205, 86',
  '255, 159, 64',
  '255, 99, 132',
]

function nameOfColumn(column) {
  return column.name === '-'
    ? column.inbox.name
    : column.name;
}

function Cfd($chart, updateInterval, speed) {
  const ctx = $chart.getContext('2d');

  const config = {
    type: 'line',
    data: {
      datasets: []
    },
    options: {
      animation: false,
      scales: {
        x: {
          type: 'linear',
          ticks: {stepSize: 5}
        },
        y: {
          type: 'linear',
          ticks: {stepSize: 5},
          stacked: true,
        },
      },
      plugins: {
        legend: {display: true, position: 'top', align: 'start', reverse: false},
      }
    },
  };

  const chart = new Chart(ctx, config);

  PubSub.subscribe('board.ready', (t, board) => {
    const start = new Date();

    function currentDate() {
      return (new Date() - start) * speed / 1000;
    }

    chart.data.datasets = board.columns
      .map(nameOfColumn)
      .filter(distinct)
      .map((column, index) => createDataset(column, colors[index]))

    const timerId = setInterval(() => chart.update(), updateInterval);

    PubSub.subscribe('board.done', () => {
      clearInterval(timerId);
      chart.update()
    });

    let previousPoint = {x: 1, y: 1};
    PubSub.subscribe('workitem.added', (topic, data) => {
      const newPoint = {x: currentDate(), y: previousPoint.y + 1};
      previousPoint = newPoint;
      chart.data.datasets[1].data.push(newPoint)
    });

    PubSub.subscribe('workitem.removed', (topic, data) => {
      const newPoint = {x: currentDate(), y: previousPoint.y - 1};
      previousPoint = newPoint;
      chart.data.datasets[1].data.push(newPoint)
    });
  });

  return chart
}

module.exports = Cfd