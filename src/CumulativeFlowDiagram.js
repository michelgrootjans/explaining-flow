const Chart = require('chart.js');
const PubSub = require("pubsub-js");

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

const Column = name => {
  let count = 0;
  return {
    name,
    count: () => count,
    increment: () => count++,
    decrement: () => count--,
  };
};

const Columns = rawColumns => {
  const columns = rawColumns
    .filter(c => c.type === 'work' || c.name === 'Done')
    .map(c => Column(c.name))

  const find = name => columns.find(c => c.name === name) || Column('n/a');

  return {
    increment: (column) => find(column.name).increment(),
    decrement: (column) => find(column.name).decrement(),

    columns: () => columns.map(c => ({name: c.name, count: c.count()}))
  };
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
        legend: {display: true, position: 'left', align: 'start', reverse: true},
      }
    },
  };

  const chart = new Chart(ctx, config);

  PubSub.subscribe('board.ready', (t, board) => {
    const timerId = setInterval(() => chart.update(), updateInterval);
    PubSub.subscribe('board.done', () => {
      clearInterval(timerId);
      chart.update()
    });

    PubSub.subscribe('workitem.added', (topic, data) => {
    });

    PubSub.subscribe('workitem.removed', (topic, data) => {
    });
  });

  return chart
}

module.exports = Cfd