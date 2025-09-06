const {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} = require('chart.js');
Chart.register(ArcElement, LineElement, BarElement, PointElement, BarController, BubbleController, DoughnutController, LineController, PieController, PolarAreaController, RadarController, ScatterController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip, SubTitle);
const PubSub = require("pubsub-js");

const distinct = (value, index, self) => self.indexOf(value) === index;

const createDataset = (label, color) =>
  ({
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
          beginAtZero: true,
          suggestedMax: 20,
          title: {
            display: true,
            text: 'Project days'
          }
        },
        y: {
          type: 'linear',
          ticks: {stepSize: 50},
          stacked: true,
          suggestedMax: 20,
          title: {
            display: true,
            text: '#items done'
          }

        },
      },
      plugins: {
        legend: {display: true, position: 'bottom', align: 'start', reverse: true},
        title: {
          display: true,
          text: 'Cumulative flow diagram'
        }
      }
    },
  };

  const chart = new Chart(ctx, config);

  PubSub.subscribe('board.ready', (t, board) => {
    const start = new Date();

    function currentDate() {
      return (new Date() - start) * speed / 1000;
    }

    const columns = {}
    board.columns
      .map(nameOfColumn)
      .filter(distinct)
      .forEach(name => columns[name] = 0)

    chart.data.datasets = board.columns
      .map(nameOfColumn)
      .filter(distinct)
      .filter(c => c !== 'Backlog')
      .map((column, index) => createDataset(column, colors[index]))
      .reverse()

    if (updateInterval) {
      const timerId = setInterval(() => chart.update(), updateInterval);

      PubSub.subscribe('board.done', () => {
        clearInterval(timerId);
        chart.update()
      });
    } else {
      PubSub.subscribe('board.done', () => {
        chart.update()
      });
    }

    PubSub.subscribe('workitem.added', (topic, data) => {
      const x = currentDate();

      const execute = () => {
        const columnName = nameOfColumn(data.column)
        if (columnName === 'Backlog') {
          columns[columnName]++
        } else {
          columns[columnName]++;

          const inboxName = nameOfColumn(data.column.inbox);
          columns[inboxName]--;
        }
        chart.data.datasets.forEach(ds => ds.data.push({x, y: columns[ds.label]}))
      };
      if (['Done'].includes(data.column.name)) execute()
      if (data.column.type === 'work') execute();
    });
  });

  return chart
}

module.exports = Cfd
