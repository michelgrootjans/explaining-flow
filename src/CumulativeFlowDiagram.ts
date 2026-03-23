import {
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
} from 'chart.js';
import PubSub from 'pubsub-js';

Chart.register(ArcElement, LineElement, BarElement, PointElement, BarController, BubbleController, DoughnutController, LineController, PieController, PolarAreaController, RadarController, ScatterController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip, SubTitle);

const distinct = (value: any, index: number, self: any[]) => self.indexOf(value) === index;

const createDataset = (label: string, color: string) =>
  ({
    label: label,
    type: 'line',
    data: [] as any[],
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

function nameOfColumn(column: any) {
  return column.name === '-'
    ? column.inbox.name
    : column.name;
}

function Cfd($chart: HTMLCanvasElement, updateInterval: number, speed: number) {
  const ctx = $chart.getContext('2d')!;

  const config = {
    type: 'line' as const,
    data: {
      datasets: [] as any[]
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
      interaction: {
        mode: 'index' as const,
        intersect: false,
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

  const chart = new Chart(ctx, config as any);

  PubSub.subscribe('board.ready', (t: string, board: any) => {
    const start = new Date();

    function currentDate() {
      return (new Date().getTime() - start.getTime()) * speed / 1000;
    }

    const columns: Record<string, number> = {}
    board.columns
      .map(nameOfColumn)
      .filter(distinct)
      .forEach((name: string) => columns[name] = 0)

    chart.data.datasets = board.columns
      .map(nameOfColumn)
      .filter(distinct)
      .filter((c: string) => c !== 'Backlog')
      .map((column: string, index: number) => createDataset(column, colors[index]!))
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

    PubSub.subscribe('workitem.added', (topic: string, data: any) => {
      const x = currentDate();

      const execute = () => {
        const columnName = nameOfColumn(data.column)
        if (columnName === 'Backlog') {
          columns[columnName] = (columns[columnName] ?? 0) + 1;
        } else {
          columns[columnName] = (columns[columnName] ?? 0) + 1;

          const inboxName = nameOfColumn(data.column.inbox);
          columns[inboxName] = (columns[inboxName] ?? 0) - 1;
        }
        chart.data.datasets.forEach((ds: any) => ds.data.push({x, y: columns[ds.label] ?? 0}))
      };
      if (['Done'].includes(data.column.name)) execute()
      if (data.column.type === 'work') execute();
    });
  });

  return chart
}

export default Cfd;
