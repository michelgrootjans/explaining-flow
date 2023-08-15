const TimeAdjustments = require('./timeAdjustments');
const Chart = require('chart.js');
const annotationPlugin = require('chartjs-plugin-annotation');
const PubSub = require("pubsub-js");
const BINSIZE = 25;

Chart.register(annotationPlugin);

function createChart(ctx,speed) {
  const histogram = {}
  const labels = [];
  const startTime = new Date();
  const percentile = { cycletimes: [], binned: false, average: 0, sle: 0 };

  const data = {
    datasets: [
      {
        label: 'Cycle time frequency',
        data: histogram,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5,
        minBarThickness: 5,
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
        },
        annotation: {
          annotations: {
            line1: {
              display: () => { return percentile.average > 0; },
              type: 'line',
              xMax: () => { return percentile.average; },
              xMin: () => { return percentile.average; },
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2,
              borderDash: [5, 5]
            },
            label1: {
              display: () => { return percentile.average > 0; },
              type: 'label',
              rotation: 270,
              xValue: () => { return percentile.average; },
              yValue: () => { return Math.max(...(Object.values(histogram))); },
              yAdjust: 15,
              xAdjust: -10,
              color: 'rgb(255, 99, 132)',
              fontSize: 8,
              content: '50%',
            }
          }
        },
      }
    }
  };
  const chart = new Chart(ctx, config);
  return {histogram, percentile, chart, labels};
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
      let duration = item.duration / (TimeAdjustments.multiplicator() * 1000);
      state.percentile.cycletimes.push(duration);
      state.percentile.cycletimes.sort((a,b) => { return a-b; });

      duration = Math.floor(duration * 10)/10; /* bucket into 10ths of day */

      if (state.percentile.binned || Object.keys(state.histogram).length>BINSIZE) {
        let bins = {};
        let cycletimes_rev = JSON.parse(JSON.stringify(state.percentile.cycletimes)).reverse();
        let chunk = (cycletimes_rev[0] - cycletimes_rev[cycletimes_rev.length-1])/BINSIZE;
        let chunk_top = cycletimes_rev[cycletimes_rev.length-1]+chunk
        let chunk_mid = Math.floor((chunk_top-(chunk/2))*10)/10;
        while (cycletimes_rev.length>0) {
          let c = cycletimes_rev.pop();
          if (c < chunk_top) {
            if (bins[chunk_mid] === undefined) {
              bins[chunk_mid] = 0;
            }
            bins[chunk_mid] = bins[chunk_mid] + 1;
          } else {
            cycletimes_rev.push(c);
            chunk_top += chunk;
            chunk_mid = Math.floor((chunk_top-(chunk/2))*10)/10;
          }
        }
        state.percentile.binned = true;
        for (var prop in state.histogram) {
          if (state.histogram.hasOwnProperty(prop)) {
            delete state.histogram[prop];
          }
        }
        Object.assign(state.histogram, bins);
      } else {
        if (state.histogram[duration] === undefined) {
          state.histogram[duration] = 0;
        }
        state.histogram[duration] = state.histogram[duration] + 1;
      }


      if (state.percentile.cycletimes.length>1) {
        let pos = Math.floor(state.percentile.cycletimes.length/2);
        state.percentile.average = state.percentile.cycletimes[pos];
      }
    });
  });

  return state.chart;
}

module.exports = HistogramChart
