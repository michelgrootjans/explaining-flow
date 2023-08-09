const TimeAdjustments = require('./timeAdjustments');
const Chart = require('chart.js');
const PubSub = require("pubsub-js");

function createChart(ctx,speed) {
  const histogram = {}
  const labels = [];
  const startTime = new Date();

  const data = {
    datasets: [
      {
        label: 'Cycle time frequency',
        data: histogram,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5,
        minBarThickness: 3,
      },
    ]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      animation: false,
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Cycle time (days)'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Frequency (# of work items)'
          }
        },
      },
      plugins: {
        legend: {display: true, position: 'bottom', align: 'start'},
        title: {
          display: true,
          text: 'Cycle time histogram'
        }
      }
    }
  };
  const chart = new Chart(ctx, config);
  return {histogram, chart, labels};
}

function HistogramChart($chart, updateInterval, speed) {
  const ctx = $chart.getContext('2d');

  let state = createChart(ctx, speed);
  PubSub.subscribe('board.ready', () => {
    const timerId = setInterval(() => state.chart.update(), updateInterval);
    PubSub.subscribe('board.done', () => {
      clearInterval(timerId);
      state.chart.update();
    });

    PubSub.subscribe('workitem.finished', (topic, item) => {
      duration = item.duration / (TimeAdjustments.multiplicator() * 1000);
      duration = Math.floor(duration * 10)/10; /* bucket into 10ths of day */
      if (state.histogram[duration] !== undefined) {
          state.histogram[duration] = state.histogram[duration] + 1;
      } else {
          state.histogram[duration] = 1;
      }
    });
  });

  return state.chart;
}

module.exports = HistogramChart
