const {publish, subscribe} = require('./publish-subscribe')

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
        },
        y: {
          type: 'linear',
          ticks: {stepSize: 50, mirror: true},
          stacked: true,
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

  subscribe('board.ready', (t, {columns, timestamp: boardStart}) => {

    const currentDate = now => (now - boardStart) * speed / 1000;

    const localColumns = {}
    columns
      .map(nameOfColumn)
      .filter(distinct)
      .forEach(name => localColumns[name] = 0)

    chart.data.datasets = columns
      .map(nameOfColumn)
      .filter(distinct)
      .filter(c => c !== 'Backlog')
      .map((column, index) => createDataset(column, colors[index]))
      .reverse()

    if (updateInterval) {
      const timerId = setInterval(() => chart.update(), updateInterval);

      subscribe('board.done', () => {
        clearInterval(timerId);
        chart.update()
      });
    } else {
      subscribe('board.done', () => {
        chart.update()
      });
    }

    subscribe('workitem.added', (topic, {column, timestamp}) => {
      const x = currentDate(timestamp);

      const execute = () => {
        const columnName = nameOfColumn(column)
        if (columnName === 'Backlog') {
          localColumns[columnName]++
        } else {
          localColumns[columnName]++;

          const inboxName = nameOfColumn(column.inbox);
          localColumns[inboxName]--;
        }
        chart.data.datasets.forEach(ds => ds.data.push({x, y: localColumns[ds.label]}))
      };
      if (['Done'].includes(column.name)) execute()
      if (column.type === 'work') execute();
    });
  });

  return chart
}

module.exports = Cfd